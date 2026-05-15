from django.urls import re_path

from .views import BookingViewSet, BookingChangeRequestViewSet


booking_create = BookingViewSet.as_view({"post": "create"})
booking_bulk_create = BookingViewSet.as_view({"post": "bulk_create"})
booking_user_list = BookingViewSet.as_view({"get": "user_bookings"})
booking_worker_list = BookingViewSet.as_view({"get": "worker_bookings"})
booking_partial_update = BookingViewSet.as_view({"patch": "partial_update"})
booking_status_update = BookingViewSet.as_view({"patch": "update_status"})
booking_change_request = BookingViewSet.as_view({"post": "change_request", "patch": "change_request"})
change_request_handle = BookingChangeRequestViewSet.as_view({"patch": "handle"})

urlpatterns = [
    re_path(r"^$", booking_create, name="booking-create"),
    re_path(r"^bulk/?$", booking_bulk_create, name="booking-bulk-create"),
    re_path(r"^user/?$", booking_user_list, name="booking-user-list"),
    re_path(r"^worker/?$", booking_worker_list, name="booking-worker-list"),
    re_path(r"^(?P<pk>\d+)/?$", booking_partial_update, name="booking-partial-update"),
    re_path(r"^(?P<pk>\d+)/status/?$", booking_status_update, name="booking-status-update"),
    re_path(r"^(?P<pk>\d+)/change-request/?$", booking_change_request, name="booking-change-request"),
    re_path(r"^change-requests/(?P<pk>\d+)/handle/?$", change_request_handle, name="change-request-handle"),
]
