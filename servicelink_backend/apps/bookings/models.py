from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator


class Booking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        NAVIGATING = "navigating", "Navigating"
        ARRIVED = "arrived", "Arrived"
        WORKING = "working", "Working"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    STATUS_TRANSITIONS = {
        Status.PENDING: {Status.CONFIRMED, Status.CANCELLED},
        Status.CONFIRMED: {Status.NAVIGATING, Status.CANCELLED},
        Status.NAVIGATING: {Status.ARRIVED, Status.CANCELLED},
        Status.ARRIVED: {Status.WORKING, Status.CANCELLED},
        Status.WORKING: {Status.COMPLETED},
        Status.COMPLETED: set(),
        Status.CANCELLED: set(),
    }

    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="bookings",
    )
    worker = models.ForeignKey(
        "workers.Worker",
        on_delete=models.SET_NULL,
        related_name="bookings",
        null=True,
        blank=True,
    )
    tool = models.ForeignKey(
        "tools.Tool",
        on_delete=models.SET_NULL,
        related_name="bookings",
        null=True,
        blank=True,
    )
    date = models.DateField()
    time = models.TimeField()
    address = models.CharField(max_length=255)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    booking_type = models.CharField(
        max_length=20,
        choices=[('daily', 'Daily'), ('monthly', 'Monthly'), ('hourly', 'Hourly'), ('tool', 'Tool')],
        default='daily',
    )
    working_days = models.JSONField(
        default=list,
        blank=True,
        help_text="List of day names e.g. ['Mon','Tue','Wed','Thu','Fri','Sat']",
    )
    hours_per_day = models.IntegerField(
        null=True,
        blank=True,
        help_text="Hours per day for hourly/monthly modes",
    )
    monthly_duration_months = models.IntegerField(
        null=True,
        blank=True,
        help_text="Duration in months (1-6 months)",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(
                check=(
                    (models.Q(worker__isnull=False) & models.Q(tool__isnull=True))
                    | (models.Q(worker__isnull=True) & models.Q(tool__isnull=False))
                ),
                name="booking_exactly_one_target",
            )
        ]

    def __str__(self) -> str:
        target = self.worker or self.tool
        return f"Booking #{self.pk} - {target}"

    @property
    def resource(self):
        return self.worker or self.tool

    @property
    def resource_type(self) -> str:
        return "worker" if self.worker_id else "tool"

    def clean(self):
        if bool(self.worker_id) == bool(self.tool_id):
            raise ValidationError("A booking must reference exactly one worker or tool.")
        if self.date and self.date < timezone.localdate():
            raise ValidationError({"date": "Booking date cannot be in the past."})


class Review(models.Model):
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name="review",
    )
    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="reviews_given",
    )
    worker = models.ForeignKey(
        "workers.Worker",
        on_delete=models.CASCADE,
        related_name="reviews",
        null=True,
        blank=True,
    )
    tool = models.ForeignKey(
        "tools.Tool",
        on_delete=models.CASCADE,
        related_name="reviews",
        null=True,
        blank=True,
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # A user can only review a booking once (OneToOne handles this)
        # But we also ensure integrity via logic
        ordering = ["-created_at"]

    def __str__(self):
        return f"Review for {self.booking}"

    def clean(self):
        if self.booking.status != Booking.Status.COMPLETED:
            raise ValidationError("You can only review completed bookings.")


class IdempotencyKey(models.Model):
    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="idempotency_keys",
    )
    idempotency_key = models.UUIDField(db_index=True)
    request_hash = models.CharField(max_length=64)
    response_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "idempotency_key")
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.email} - {self.idempotency_key}"


class BookingChangeRequest(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"

    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="change_requests",
    )
    requested_by_user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="change_requests_made",
    )
    field_name = models.CharField(
        max_length=255,
        help_text="Name of the field being requested to change",
    )
    old_value = models.TextField(
        help_text="Previous value of the field",
    )
    new_value = models.TextField(
        help_text="Requested new value of the field",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Change Request #{self.pk} for Booking #{self.booking.pk}"

    def clean(self):
        # Only allow change requests when booking status is confirmed
        if self.booking.status != Booking.Status.CONFIRMED:
            raise ValidationError(
                "Change requests can only be made for confirmed bookings."
            )
        # Never allow changes to payment amount
        if self.field_name == "total_price":
            raise ValidationError("Cannot request changes to payment amount.")
