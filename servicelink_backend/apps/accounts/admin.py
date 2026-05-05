from django.contrib import admin

from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "name", "phone", "city", "is_worker", "is_active")
    list_filter = ("is_worker", "is_active", "is_staff", "city")
    search_fields = ("email", "name", "phone", "city")
    ordering = ("email",)
    readonly_fields = ("date_joined", "last_login")
    fieldsets = (
        (
            "Account",
            {
                "fields": (
                    "email",
                    "password",
                    "name",
                    "phone",
                    "address",
                    "city",
                    "pincode",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_worker",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Metadata", {"fields": ("date_joined", "last_login")}),
    )
