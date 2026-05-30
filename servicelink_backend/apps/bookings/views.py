import hashlib
import json

from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Booking, IdempotencyKey, BookingChangeRequest
from .permissions import IsBookingOwner, IsBookingOwnerOrWorker, IsAssignedWorkerForChangeRequest
from .serializers import (
    BookingCreateSerializer,
    BookingSerializer,
    BookingUpdateSerializer,
    BulkBookingSerializer,
    BookingChangeRequestSerializer,
    BookingChangeRequestCreateSerializer,
    BookingChangeRequestUpdateSerializer,
)


class BookingChangeRequestViewSet(viewsets.GenericViewSet):
    """Standalone viewset for workers to accept/reject change requests."""
    permission_classes = [permissions.IsAuthenticated, IsAssignedWorkerForChangeRequest]
    queryset = BookingChangeRequest.objects.select_related("booking__worker__user", "booking__user").all()

    @action(detail=True, methods=["patch"], url_path="handle")
    def handle(self, request, pk=None):
        change_request = self.get_object()

        serializer = BookingChangeRequestUpdateSerializer(
            change_request, data=request.data, partial=True,
            context=self.get_serializer_context()
        )
        serializer.is_valid(raise_exception=True)
        updated = serializer.save()
        return Response(BookingChangeRequestSerializer(updated).data)


class BookingViewSet(
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [permissions.IsAuthenticated, IsBookingOwnerOrWorker]
    queryset = Booking.objects.select_related("user", "worker__user", "tool").all()
    http_method_names = ["get", "post", "patch"]

    def get_queryset(self):
        from django.db.models import Q
        user = self.request.user
        if not user.is_authenticated:
            return self.queryset.none()
        if user.is_worker and hasattr(user, 'worker_profile'):
            return self.queryset.filter(Q(user=user) | Q(worker=user.worker_profile))
        return self.queryset.filter(user=user)

    def get_permissions(self):
        # Honor action-level permission_classes overrides even when manually routed via as_view()
        if hasattr(self, "action") and self.action:
            action_func = getattr(self, self.action, None)
            if action_func and hasattr(action_func, "permission_classes"):
                return [permission() for permission in action_func.permission_classes]
        return super().get_permissions()

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
        ).prefetch_related(
            "change_requests"
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
        try:
            booking = Booking.objects.select_related("user", "worker__user", "tool").get(pk=pk)
        except Booking.DoesNotExist:
            return Response({"detail": "Booking not found."}, status=status.HTTP_404_NOT_FOUND)
        self.check_object_permissions(request, booking)
        serializer = BookingUpdateSerializer(
            booking, data=request.data, partial=True, context=self.get_serializer_context()
        )
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

    @action(detail=True, methods=["post", "patch"], url_path="change-request",
            permission_classes=[permissions.IsAuthenticated])
    def change_request(self, request, pk=None, *args, **kwargs):
        """Handle booking change requests.
        
        POST: Create a new change request (only by booking owner, for confirmed bookings)
        PATCH: Accept/Reject a change request (only by assigned worker)
        """
        try:
            booking = Booking.objects.select_related("user", "worker__user").get(pk=pk)
        except Booking.DoesNotExist:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if request.method == "POST":
            # Create a new change request
            serializer = BookingChangeRequestCreateSerializer(
                data=request.data,
                context={**self.get_serializer_context(), "booking_id": pk}
            )
            serializer.is_valid(raise_exception=True)
            change_request = serializer.save()
            return Response(
                BookingChangeRequestSerializer(change_request).data,
                status=status.HTTP_201_CREATED,
            )

        elif request.method == "PATCH":
            # Verify requester is the assigned worker
            if not (booking.worker and hasattr(request.user, 'worker_profile')
                    and booking.worker_id == request.user.worker_profile.id):
                return Response(
                    {"detail": "Only the assigned worker can handle change requests."},
                    status=status.HTTP_403_FORBIDDEN,
                )
            # Accept/Reject a change request
            # Get change_request_id from query params
            change_request_id = request.query_params.get("change_request_id") or request.data.get("change_request_id")
            
            if not change_request_id:
                return Response(
                    {"detail": "change_request_id is required."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            
            try:
                change_request = BookingChangeRequest.objects.get(
                    pk=change_request_id,
                    booking_id=pk
                )
            except BookingChangeRequest.DoesNotExist:
                return Response(
                    {"detail": "Change request not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            serializer = BookingChangeRequestUpdateSerializer(
                change_request,
                data=request.data,
                partial=True,
                context=self.get_serializer_context()
            )
            serializer.is_valid(raise_exception=True)
            updated_request = serializer.save()
            return Response(
                BookingChangeRequestSerializer(updated_request).data,
                status=status.HTTP_200_OK,
            )
