"""Development settings — DEBUG=True, local database, relaxed security."""

from .base import *  # noqa: F401, F403

DEBUG = True
ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", ["127.0.0.1", "localhost", "*"])

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Allow DATABASE_URL to override
database_from_env = database_from_url()
if database_from_env:
    if database_from_env.get("ENGINE") == "django.db.backends.sqlite3":
        DATABASES["default"] = database_from_env
    else:
        DATABASES["default"].update(database_from_env)

# Relaxed security for local dev
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
