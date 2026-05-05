from django.contrib import admin

from .models import Tool


@admin.register(Tool)
class ToolAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "category", "price_per_day", "availability")
    list_filter = ("category", "availability")
    search_fields = ("name", "category", "description")
