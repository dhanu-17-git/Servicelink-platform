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

from .models import Booking


class BookingSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)
    worker = WorkerSerializer(read_only=True)
    tool = ToolSerializer(read_only=True)
    booking_type = serializers.CharField(read_only=True)

    class Meta:
        model = Booking
        fields = [
            "id",
            "user",
            "worker",
            "tool",
            "booking_type",
            "date",
            "time",
            "address",
            "total_price",
            "status",
            "created_at",
        ]


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
