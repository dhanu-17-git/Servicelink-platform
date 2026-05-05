from rest_framework import serializers

from .models import Tool


class ToolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tool
        fields = [
            "id",
            "name",
            "description",
            "category",
            "price_per_day",
            "image_url",
            "availability",
        ]
