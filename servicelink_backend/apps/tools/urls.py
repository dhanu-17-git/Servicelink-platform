from django.urls import re_path

from .views import ToolViewSet


tool_list = ToolViewSet.as_view({"get": "list"})
tool_detail = ToolViewSet.as_view({"get": "retrieve"})

urlpatterns = [
    re_path(r"^$", tool_list, name="tool-list"),
    re_path(r"^(?P<pk>\d+)/?$", tool_detail, name="tool-detail"),
]
