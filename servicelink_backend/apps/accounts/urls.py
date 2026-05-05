from django.urls import re_path

from .views import LoginView, ProfileView, RefreshView, RegisterView


urlpatterns = [
    re_path(r"^register/?$", RegisterView.as_view(), name="register"),
    re_path(r"^login/?$", LoginView.as_view(), name="login"),
    re_path(r"^refresh/?$", RefreshView.as_view(), name="token-refresh"),
    re_path(r"^profile/?$", ProfileView.as_view(), name="profile"),
]
