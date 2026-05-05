from decimal import Decimal

from django.core.exceptions import ValidationError
from django.db import models


class Worker(models.Model):
    class Skill(models.TextChoices):
        # Construction & Repair
        MASON = "mason", "Mason"
        CARPENTER = "carpenter", "Carpenter"
        ELECTRICIAN = "electrician", "Electrician"
        PLUMBER = "plumber", "Plumber"
        WELDER = "welder", "Welder"
        PAINTER = "painter", "Painter"
        TILE_WORKER = "tile_worker", "Tile Worker"
        CONCRETE_WORKER = "concrete_worker", "Concrete Worker"
        ROOFER = "roofer", "Roofer"
        # Home Services
        HOUSE_CLEANER = "house_cleaner", "House Cleaner"
        COOK = "cook", "Cook"
        BABYSITTER = "babysitter", "Babysitter"
        CARETAKER = "caretaker", "Caretaker"
        GARDENER = "gardener", "Gardener"
        PEST_CONTROL = "pest_control", "Pest Control Worker"
        # Transport & Moving
        LOADER = "loader", "Loader / Unloader"
        MOVER = "mover", "Mover"
        DELIVERY = "delivery", "Delivery Worker"
        DRIVER = "driver", "Driver"
        # Skilled Technical
        AC_TECHNICIAN = "ac_technician", "AC Technician"
        FRIDGE_TECHNICIAN = "fridge_technician", "Refrigerator Repair Technician"
        WASHING_TECHNICIAN = "washing_technician", "Washing Machine Technician"
        MOBILE_TECHNICIAN = "mobile_technician", "Mobile Repair Technician"
        COMPUTER_TECHNICIAN = "computer_technician", "Computer Technician"
        # Agriculture & Outdoor
        FARM_WORKER = "farm_worker", "Farm Worker"
        HARVESTER = "harvester", "Harvester"
        IRRIGATION = "irrigation", "Irrigation Worker"
        DAIRY_WORKER = "dairy_worker", "Dairy Worker"
        # Industrial
        FACTORY_WORKER = "factory_worker", "Factory Worker"
        MACHINE_OPERATOR = "machine_operator", "Machine Operator"
        PACKAGING_WORKER = "packaging_worker", "Packaging Worker"
        WAREHOUSE_WORKER = "warehouse_worker", "Warehouse Worker"
        # Event & Temporary
        EVENT_SETUP = "event_setup", "Event Setup Worker"
        DECORATOR = "decorator", "Decorator"
        SOUND_LIGHT = "sound_light", "Sound/Light Technician"
        SECURITY_GUARD = "security_guard", "Security Guard"

    user = models.OneToOneField(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="worker_profile",
    )
    skill = models.CharField(max_length=50, choices=Skill.choices, db_index=True)
    experience = models.PositiveIntegerField(help_text="Years of experience")
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal("0.00"))
    availability = models.BooleanField(default=True, db_index=True)
    price_per_hour = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ["-rating", "id"]

    def __str__(self) -> str:
        return f"{self.user.name} ({self.get_skill_display()})"

    def clean(self):
        if self.user_id and not self.user.is_worker:
            raise ValidationError({"user": "Linked user must be marked as a worker."})
