from django.urls import re_path

from .views import BookingViewSet


booking_create = BookingViewSet.as_view({"post": "create"})
booking_user_list = BookingViewSet.as_view({"get": "user_bookings"})
booking_worker_list = BookingViewSet.as_view({"get": "worker_bookings"})
booking_partial_update = BookingViewSet.as_view({"patch": "partial_update"})
booking_status_update = BookingViewSet.as_view({"patch": "update_status"})

urlpatterns = [
    re_path(r"^$", booking_create, name="booking-create"),
    re_path(r"^user/?$", booking_user_list, name="booking-user-list"),
    re_path(r"^worker/?$", booking_worker_list, name="booking-worker-list"),
    re_path(r"^(?P<pk>\d+)/?$", booking_partial_update, name="booking-partial-update"),
    re_path(r"^(?P<pk>\d+)/status/?$", booking_status_update, name="booking-status-update"),
]
