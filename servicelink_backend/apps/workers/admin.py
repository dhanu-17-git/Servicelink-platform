from django.contrib import admin

from .models import Worker


@admin.register(Worker)
class WorkerAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "skill", "experience", "rating", "availability")
    list_filter = ("skill", "availability")
    search_fields = ("user__name", "user__email", "user__city")
    autocomplete_fields = ("user",)
