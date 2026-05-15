from rest_framework import serializers

from apps.accounts.serializers import PublicUserSerializer

from .models import Worker


class WorkerSerializer(serializers.ModelSerializer):
    user = PublicUserSerializer(read_only=True)
    name = serializers.CharField(source="user.name", read_only=True)
    city = serializers.CharField(source="user.city", read_only=True)

    class Meta:
        model = Worker
        fields = [
            "id",
            "user",
            "name",
            "city",
            "skill",
            "experience",
            "rating",
            "availability",
            "price_per_hour",
            "languages",
            "bio",
            "specializations",
            "response_time_minutes",
            "is_id_verified",
            "service_areas",
            "working_hours_start",
            "working_hours_end",
        ]


class WorkerUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Worker
        fields = [
            "languages",
            "bio",
            "specializations",
            "response_time_minutes",
            "service_areas",
            "working_hours_start",
            "working_hours_end",
        ]
