import hashlib
import json

from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Booking, IdempotencyKey
from .permissions import IsBookingOwner, IsBookingOwnerOrWorker
from .serializers import (
    BookingCreateSerializer,
    BookingSerializer,
    BookingUpdateSerializer,
    BulkBookingSerializer,
)


class BookingViewSet(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [permissions.IsAuthenticated, IsBookingOwner]
    queryset = Booking.objects.select_related("user", "worker__user", "tool").all()
    http_method_names = ["get", "post", "patch"]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == "create":
            return BookingCreateSerializer
        if self.action == "partial_update":
            return BookingUpdateSerializer
        return BookingSerializer

    def _handle_idempotency(self, request, perform_create):
        idempotency_key = request.headers.get("Idempotency-Key")
        if not idempotency_key:
            return perform_create()

        request_payload = json.dumps(request.data, sort_keys=True)
        request_hash = hashlib.sha256(request_payload.encode()).hexdigest()

        # Check for existing key
        idempotency_record = IdempotencyKey.objects.filter(
            user=request.user, idempotency_key=idempotency_key
        ).first()

        if idempotency_record:
            if idempotency_record.request_hash != request_hash:
                return Response(
                    {"detail": "Idempotency key used with a different payload."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            return Response(idempotency_record.response_data, status=status.HTTP_200_OK)

        # Process request
        response = perform_create()

        # Cache response if successful
        if response.status_code == status.HTTP_201_CREATED:
            IdempotencyKey.objects.create(
                user=request.user,
                idempotency_key=idempotency_key,
                request_hash=request_hash,
                response_data=response.data,
            )

        return response

    def create(self, request, *args, **kwargs):
        def perform_create():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            booking = serializer.save()
            return Response(
                BookingSerializer(booking, context=self.get_serializer_context()).data,
                status=status.HTTP_201_CREATED,
            )

        return self._handle_idempotency(request, perform_create)

    @action(detail=False, methods=["post"], url_path="bulk")
    def bulk_create(self, request, *args, **kwargs):
        def perform_bulk_create():
            serializer = BulkBookingSerializer(
                data=request.data, context=self.get_serializer_context()
            )
            serializer.is_valid(raise_exception=True)
            bookings = serializer.save()
            return Response(
                BookingSerializer(
                    bookings, many=True, context=self.get_serializer_context()
                ).data,
                status=status.HTTP_201_CREATED,
            )

        return self._handle_idempotency(request, perform_bulk_create)

    @action(detail=False, methods=["get"], url_path="user")
    def user_bookings(self, request, *args, **kwargs):
        serializer = BookingSerializer(
            self.get_queryset(),
            many=True,
            context=self.get_serializer_context(),
        )
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="worker",
            permission_classes=[permissions.IsAuthenticated])
    def worker_bookings(self, request, *args, **kwargs):
        """Return all bookings assigned to the logged-in worker."""
        if not request.user.is_worker or not hasattr(request.user, 'worker_profile'):
            return Response(
                {"detail": "You are not registered as a worker."},
                status=status.HTTP_403_FORBIDDEN,
            )
        bookings = Booking.objects.select_related(
            "user", "worker__user", "tool"
        ).filter(worker=request.user.worker_profile).order_by("-created_at")
        serializer = BookingSerializer(
            bookings,
            many=True,
            context=self.get_serializer_context(),
        )
        return Response(serializer.data)

    @action(detail=True, methods=["patch"], url_path="status",
            permission_classes=[permissions.IsAuthenticated, IsBookingOwnerOrWorker])
    def update_status(self, request, pk=None, *args, **kwargs):
        """Allow worker or user to update booking status."""
        booking = Booking.objects.select_related("user", "worker__user", "tool").get(pk=pk)
        serializer = BookingUpdateSerializer(booking, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(BookingSerializer(updated, context=self.get_serializer_context()).data)

    def partial_update(self, request, *args, **kwargs):
        booking = self.get_object()
        self.check_object_permissions(request, booking)
        serializer = self.get_serializer(booking, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_booking = serializer.save()
        return Response(
            BookingSerializer(
                updated_booking,
                context=self.get_serializer_context(),
            ).data
        )
