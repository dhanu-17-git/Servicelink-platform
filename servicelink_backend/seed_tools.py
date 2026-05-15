import os
import django

# This script is meant to be run via `python manage.py shell < seed_tools.py`
from apps.tools.models import Tool

tools_data = [
    {
        "name": "Bosch Heavy Duty Drill",
        "description": "Professional 750W impact drill machine for concrete, metal, and wood.",
        "category": "Power Tools",
        "price_per_day": 350.00,
        "image_url": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&fit=crop",
        "availability": True
    },
    {
        "name": "Makita Angle Grinder",
        "description": "High performance 4-1/2 angle grinder for cutting and grinding metal.",
        "category": "Power Tools",
        "price_per_day": 250.00,
        "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&fit=crop",
        "availability": True
    },
    {
        "name": "DeWalt Circular Saw",
        "description": "7-1/4 inch lightweight circular saw for wood cutting.",
        "category": "Saws",
        "price_per_day": 400.00,
        "image_url": "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&fit=crop",
        "availability": True
    },
    {
        "name": "Stihl Chainsaw",
        "description": "Gas-powered chainsaw for heavy duty tree cutting and logging.",
        "category": "Outdoor",
        "price_per_day": 800.00,
        "image_url": "https://images.unsplash.com/photo-1544834891-fb45f9bd747c?w=800&fit=crop",
        "availability": True
    },
    {
        "name": "Stanley Complete Hand Tool Set",
        "description": "150-piece mechanics and home repair tool set.",
        "category": "Hand Tools",
        "price_per_day": 150.00,
        "image_url": "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=800&fit=crop",
        "availability": True
    },
    {
        "name": "Karcher Pressure Washer",
        "description": "High pressure washer for cleaning cars, patios, and driveways.",
        "category": "Cleaning",
        "price_per_day": 500.00,
        "image_url": "https://images.unsplash.com/photo-1620888941031-6e3e5de959da?w=800&fit=crop",
        "availability": True
    }
]

# Clear existing tools just in case
Tool.objects.all().delete()

# Create new tools
for t in tools_data:
    Tool.objects.create(**t)

print(f"Successfully seeded {Tool.objects.count()} tools.")
