from django.contrib import admin

from .models import Booking


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "worker",
        "tool",
        "date",
        "time",
        "status",
        "total_price",
    )
    list_filter = ("status", "date", "created_at")
    search_fields = ("user__email", "user__name", "address")
    autocomplete_fields = ("user", "worker", "tool")
