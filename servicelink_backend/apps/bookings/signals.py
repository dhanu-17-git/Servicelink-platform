from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Avg
from .models import Review


@receiver(post_save, sender=Review)
def update_worker_tool_rating(sender, instance, created, **kwargs):
    """Automatically update worker or tool average rating when a review is saved."""
    if created:
        if instance.worker:
            worker = instance.worker
            avg_rating = Review.objects.filter(worker=worker).aggregate(Avg('rating'))['rating__avg']
            worker.rating = avg_rating or 0.00
            worker.save()
        
        if instance.tool:
            tool = instance.tool
            # If your Tool model doesn't have a rating field yet, we could add it or just log it
            # For now, let's assume we focus on Workers for the demo
            pass
