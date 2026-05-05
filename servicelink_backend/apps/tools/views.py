from django.db.models import Q
from rest_framework import permissions, viewsets

from .models import Tool
from .serializers import ToolSerializer


class ToolViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ToolSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Tool.objects.all()
        params = self.request.query_params

        category = params.get("category")
        available = params.get("available")
        query = params.get("q")

        if category:
            queryset = queryset.filter(category__iexact=category)
        if available in {"true", "1", "yes"}:
            queryset = queryset.filter(availability=True)
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query)
                | Q(category__icontains=query)
                | Q(description__icontains=query)
            )

        return queryset.order_by("name")
