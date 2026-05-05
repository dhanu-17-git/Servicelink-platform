from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/workers/", include("apps.workers.urls")),
    path("api/tools/", include("apps.tools.urls")),
    path("api/bookings/", include("apps.bookings.urls")),
]
