from rest_framework import permissions


class IsBookingOwner(permissions.BasePermission):
    message = "You can only access your own bookings."

    def has_object_permission(self, request, view, obj) -> bool:
        return request.user.is_authenticated and obj.user_id == request.user.id


class IsBookingOwnerOrWorker(permissions.BasePermission):
    """Allow booking owner OR the assigned worker to view/update the booking."""
    message = "You can only access bookings you are involved in."

    def has_object_permission(self, request, view, obj) -> bool:
        if not request.user.is_authenticated:
            return False
        # Booking customer
        if obj.user_id == request.user.id:
            return True
        # Assigned worker
        if obj.worker_id and hasattr(request.user, 'worker_profile'):
            return obj.worker_id == request.user.worker_profile.id
        return False


class IsAssignedWorkerForChangeRequest(permissions.BasePermission):
    message = "Only the assigned worker can handle this change request."

    def has_object_permission(self, request, view, obj) -> bool:
        return (
            request.user.is_authenticated
            and obj.booking.worker
            and hasattr(request.user, "worker_profile")
            and obj.booking.worker.id == request.user.worker_profile.id
        )
