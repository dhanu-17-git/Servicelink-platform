from decimal import Decimal

from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers

from apps.accounts.serializers import PublicUserSerializer
from apps.tools.models import Tool
from apps.tools.serializers import ToolSerializer
from apps.workers.models import Worker
from apps.workers.serializers import WorkerSerializer

from .models import Booking, BookingChangeRequest


class BookingSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)
    worker = WorkerSerializer(read_only=True)
    tool = ToolSerializer(read_only=True)
    resource_type = serializers.SerializerMethodField(read_only=True)
    pending_change_request = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "user",
            "worker",
            "tool",
            "resource_type",
            "booking_type",
            "working_days",
            "hours_per_day",
            "monthly_duration_months",
            "date",
            "time",
            "address",
            "total_price",
            "status",
            "created_at",
            "pending_change_request",
        ]

    def get_resource_type(self, obj):
        return "worker" if obj.worker_id else "tool"

    def get_pending_change_request(self, obj):
        req = obj.change_requests.filter(status='pending').first()
        if not req:
            return None
        return {
            "id": req.pk,
            "field_name": req.field_name,
            "old_value": req.old_value,
            "new_value": req.new_value,
        }


class BookingCreateSerializer(serializers.ModelSerializer):
    worker_id = serializers.PrimaryKeyRelatedField(
        source="worker",
        queryset=Worker.objects.select_related("user").all(),
        required=False,
        allow_null=True,
    )
    tool_id = serializers.PrimaryKeyRelatedField(
        source="tool",
        queryset=Tool.objects.all(),
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Booking
        fields = [
            "worker_id",
            "tool_id",
            "booking_type",
            "working_days",
            "hours_per_day",
            "monthly_duration_months",
            "date",
            "time",
            "address",
            "total_price",
        ]

    def validate(self, attrs):
        request = self.context["request"]
        user = request.user
        worker = attrs.get("worker")
        tool = attrs.get("tool")
        total_price = attrs.get("total_price")
        booking_date = attrs.get("date")
        booking_type = attrs.get("booking_type", "daily")

        if not user.is_profile_complete:
            raise serializers.ValidationError(
                {
                    "user": (
                        "Complete your profile with phone, address, city, and pincode "
                        "before creating a booking."
                    )
                }
            )

        if bool(worker) == bool(tool):
            raise serializers.ValidationError(
                {"selection": "Select exactly one worker or one tool for a booking."}
            )

        if booking_date and booking_date < timezone.localdate():
            raise serializers.ValidationError(
                {"date": "Booking date cannot be in the past."}
            )

        minimum_price = worker.price_per_hour if worker else tool.price_per_day
        if total_price is None:
            attrs["total_price"] = minimum_price
        elif Decimal(total_price) < minimum_price:
            raise serializers.ValidationError(
                {
                    "total_price": (
                        f"Total price must be at least {minimum_price} for the selected item."
                    )
                }
            )

        return attrs

    @transaction.atomic
    def create(self, validated_data):
        request = self.context["request"]
        worker = validated_data.get("worker")
        tool = validated_data.get("tool")

        if worker is not None:
            worker = Worker.objects.select_for_update().select_related("user").get(
                pk=worker.pk
            )
            if not worker.availability:
                raise serializers.ValidationError(
                    {"worker_id": "Selected worker is not available."}
                )
            validated_data["worker"] = worker

        if tool is not None:
            tool = Tool.objects.select_for_update().get(pk=tool.pk)
            if not tool.availability:
                raise serializers.ValidationError(
                    {"tool_id": "Selected tool is not available."}
                )
            validated_data["tool"] = tool

        booking = Booking(user=request.user, **validated_data)
        try:
            booking.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict or exc.messages) from exc
        booking.save()

        target = worker or tool
        if target is not None and target.availability:
            target.availability = False
            target.save(update_fields=["availability"])

        return booking


class BookingUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ["date", "time", "address", "status"]

    def validate(self, attrs):
        instance = self.instance
        new_status = attrs.get("status", instance.status)
        mutable_fields = {"date", "time", "address"}

        if "status" in attrs and new_status != instance.status:
            allowed_statuses = Booking.STATUS_TRANSITIONS.get(instance.status, set())
            if new_status not in allowed_statuses:
                raise serializers.ValidationError(
                    {
                        "status": (
                            f"Cannot change status from {instance.status} to {new_status}."
                        )
                    }
                )
            
            # Role-based validation
            user = self.context["request"].user
            is_owner = instance.user == user
            is_worker = instance.worker and instance.worker.user == user

            if new_status == Booking.Status.CONFIRMED and not is_worker:
                raise serializers.ValidationError({"status": "Only workers can confirm a booking."})
            
            if new_status == Booking.Status.COMPLETED and not is_worker:
                raise serializers.ValidationError({"status": "Only workers can mark a booking as completed."})
            
            if new_status == Booking.Status.CANCELLED:
                if is_owner and instance.status == Booking.Status.CONFIRMED:
                    raise serializers.ValidationError({"status": "Cannot cancel a booking that has already been confirmed by the worker. Please contact support."})

        if any(field in attrs for field in mutable_fields) and instance.status != Booking.Status.PENDING:
            raise serializers.ValidationError(
                "Only pending bookings can update schedule or address details."
            )

        if "date" in attrs and attrs["date"] < timezone.localdate():
            raise serializers.ValidationError(
                {"date": "Booking date cannot be in the past."}
            )

        return attrs

    @transaction.atomic
    def update(self, instance, validated_data):
        previous_status = instance.status

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        try:
            instance.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.message_dict or exc.messages) from exc
        instance.save()

        if (
            previous_status != instance.status
            and instance.status in {Booking.Status.COMPLETED, Booking.Status.CANCELLED}
        ):
            self._release_target_if_free(instance)

        return instance

    def _release_target_if_free(self, booking: Booking) -> None:
        target = booking.resource
        if target is None:
            return

        if booking.worker_id:
            has_open_bookings = Booking.objects.filter(
                worker_id=booking.worker_id,
                status__in=[Booking.Status.PENDING, Booking.Status.CONFIRMED],
            ).exclude(pk=booking.pk).exists()
            locked_target = Worker.objects.select_for_update().get(pk=booking.worker_id)
        else:
            has_open_bookings = Booking.objects.filter(
                tool_id=booking.tool_id,
                status__in=[Booking.Status.PENDING, Booking.Status.CONFIRMED],
            ).exclude(pk=booking.pk).exists()
            locked_target = Tool.objects.select_for_update().get(pk=booking.tool_id)

        if not has_open_bookings and not locked_target.availability:
            locked_target.availability = True
            locked_target.save(update_fields=["availability"])


class BulkItemSerializer(BookingCreateSerializer):
    """Used for individual items within a bulk booking."""
    class Meta(BookingCreateSerializer.Meta):
        pass


class BulkBookingSerializer(serializers.Serializer):
    items = BulkItemSerializer(many=True)

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop("items")
        # items_data contains already-validated objects (e.g. 'worker' instance)
        # We pass them directly to the internal create() method.
        item_serializer = BulkItemSerializer(context=self.context)
        return [item_serializer.create(item) for item in items_data]


class BookingChangeRequestSerializer(serializers.ModelSerializer):
    requested_by_user = PublicUserSerializer(read_only=True)

    class Meta:
        model = BookingChangeRequest
        fields = [
            "id",
            "booking",
            "requested_by_user",
            "field_name",
            "old_value",
            "new_value",
            "status",
            "created_at",
        ]


class BookingChangeRequestCreateSerializer(serializers.ModelSerializer):
    old_value = serializers.CharField(required=False, allow_blank=True, default='')

    class Meta:
        model = BookingChangeRequest
        fields = [
            "field_name",
            "old_value",
            "new_value",
        ]

    def validate(self, attrs):
        request = self.context["request"]
        booking_id = self.context.get("booking_id")

        try:
            booking = Booking.objects.get(pk=booking_id)
        except Booking.DoesNotExist:
            raise serializers.ValidationError("Booking not found.")

        # Allow change requests for confirmed or navigating bookings
        if booking.status not in {Booking.Status.CONFIRMED, Booking.Status.NAVIGATING}:
            raise serializers.ValidationError(
                "Change requests can only be made for confirmed or in-progress bookings."
            )

        # Never allow changes to payment amount
        if attrs.get("field_name") == "total_price":
            raise serializers.ValidationError(
                "Cannot request changes to payment amount."
            )

        # Only the booking owner can request changes
        if booking.user != request.user:
            raise serializers.ValidationError(
                "Only the booking owner can request changes."
            )

        return attrs

    def create(self, validated_data):
        request = self.context["request"]
        booking_id = self.context.get("booking_id")
        booking = Booking.objects.get(pk=booking_id)

        return BookingChangeRequest.objects.create(
            booking=booking,
            requested_by_user=request.user,
            **validated_data
        )


class BookingChangeRequestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingChangeRequest
        fields = ["status"]

    def validate(self, attrs):
        request = self.context["request"]
        instance = self.instance
        new_status = attrs.get("status", instance.status)

        # Only the worker can accept/reject change requests
        if instance.booking.worker is None or instance.booking.worker.user != request.user:
            raise serializers.ValidationError(
                "Only the assigned worker can accept or reject change requests."
            )

        # Lock change requests when booking is not confirmed or navigating
        locked_statuses = {
            Booking.Status.ARRIVED,
            Booking.Status.WORKING,
            Booking.Status.COMPLETED,
            Booking.Status.CANCELLED,
        }
        if instance.booking.status in locked_statuses:
            raise serializers.ValidationError(
                "Cannot modify change requests for bookings that have already arrived or finished."
            )

        return attrs

    @transaction.atomic
    def update(self, instance, validated_data):
        previous_status = instance.status
        new_status = validated_data.get("status", instance.status)

        # Update the status
        instance.status = new_status
        instance.save()

        # If accepted, update the booking field
        if new_status == BookingChangeRequest.Status.ACCEPTED and previous_status == BookingChangeRequest.Status.PENDING:
            booking = instance.booking
            field_name = instance.field_name
            new_value = instance.new_value

            # Update the booking field
            setattr(booking, field_name, new_value)
            booking.save()

        # If rejected, auto-cancel the booking
        if new_status == BookingChangeRequest.Status.REJECTED and previous_status == BookingChangeRequest.Status.PENDING:
            booking = instance.booking
            booking.status = Booking.Status.CANCELLED
            booking.save(update_fields=["status"])

        return instance
