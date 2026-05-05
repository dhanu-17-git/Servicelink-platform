from django.urls import re_path

from .views import WorkerViewSet


worker_list = WorkerViewSet.as_view({"get": "list"})
worker_detail = WorkerViewSet.as_view({"get": "retrieve"})

urlpatterns = [
    re_path(r"^$", worker_list, name="worker-list"),
    re_path(r"^(?P<pk>\d+)/?$", worker_detail, name="worker-detail"),
]
