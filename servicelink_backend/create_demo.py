import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "servicelink.settings.development")
django.setup()

from apps.accounts.models import User

if not User.objects.filter(email="demo@gmail.com").exists():
    User.objects.create_user(
        email="demo@gmail.com",
        password="password123",
        name="Demo Customer",
        phone="9876500000",
        is_worker=False,
        city="Mysore",
        address="NIE North Campus, Manandavadi Road, Mysore",
        pincode="570008"
    )
    print("Created demo user")
else:
    print("User already exists")
