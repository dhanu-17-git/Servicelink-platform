from django.db.models import Q
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .models import Worker
from .serializers import WorkerSerializer, WorkerUpdateSerializer


class WorkerViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = WorkerSerializer
    permission_classes = [permissions.AllowAny]
    http_method_names = ["get", "patch", "options"]

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

    def get_serializer_class(self):
        if self.action == "partial_update":
            return WorkerUpdateSerializer
        return WorkerSerializer

    def partial_update(self, request, *args, **kwargs):
        """Allow a worker to update their own profile."""
        worker_id = kwargs.get("pk")
        
        try:
            worker = Worker.objects.get(pk=worker_id)
        except Worker.DoesNotExist:
            return Response(
                {"detail": "Worker not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Only the worker themselves can update their profile
        if worker.user != request.user or not request.user.is_worker:
            return Response(
                {"detail": "You can only update your own worker profile."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(worker, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_worker = serializer.save()
        
        return Response(
            WorkerSerializer(updated_worker, context=self.get_serializer_context()).data,
            status=status.HTTP_200_OK,
        )
