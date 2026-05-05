from django.db.models import Q
from rest_framework import permissions, viewsets

from .models import Worker
from .serializers import WorkerSerializer


class WorkerViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = WorkerSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Worker.objects.select_related("user").filter(user__is_active=True)
        params = self.request.query_params

        skill = params.get("skill")
        city = params.get("city")
        available = params.get("available")
        query = params.get("q")

        if skill:
            queryset = queryset.filter(skill__iexact=skill)
        if city:
            queryset = queryset.filter(user__city__icontains=city)
        if available in {"true", "1", "yes"}:
            queryset = queryset.filter(availability=True)
        if query:
            queryset = queryset.filter(
                Q(user__name__icontains=query)
                | Q(skill__icontains=query)
                | Q(user__city__icontains=query)
            )

        return queryset.order_by("-rating", "id")
