"""
Seed script for ServiceLink V2 — synced with the new Upscaled frontend data.
Wipes old workers/tools and creates fresh data matching dummyData.js exactly.
"""
import os
import django
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "servicelink.settings.development")
django.setup()

from apps.accounts.models import User
from apps.workers.models import Worker
from apps.tools.models import Tool
from apps.bookings.models import Booking


def seed():
    print("=" * 60)
    print("  ServiceLink V2 — Full Data Seed")
    print("=" * 60)

    # ── STEP 1: Wipe old data ──
    print("\n[1/3] Wiping old data...")
    Booking.objects.all().delete()
    Worker.objects.all().delete()
    Tool.objects.all().delete()
    # Delete worker user accounts (keep admin/normal users)
    User.objects.filter(is_worker=True).delete()
    print("  - Old workers, tools, and bookings deleted.")

    # ── STEP 2: Create Workers (matching dummyData.js) ──
    print("\n[2/3] Creating 36 workers...")

    workers_data = [
        # Construction & Repair
        ("Rajesh Kumar", "mason", 4.8, 350, "Gokulam", 8, True),
        ("Suresh Patel", "carpenter", 4.9, 400, "Jayalakshmipuram", 12, True),
        ("Manoj Verma", "electrician", 4.5, 320, "Vijayanagar", 4, True),
        ("Amit Sharma", "plumber", 4.6, 300, "Kuvempunagar", 5, True),
        ("Prakash Rao", "welder", 4.6, 450, "J.P. Nagar", 9, True),
        ("Vikram Singh", "painter", 4.7, 280, "Saraswathipuram", 6, True),
        ("Ravi Tiwari", "tile_worker", 4.4, 370, "Hebbal", 7, True),
        ("Santosh Gupta", "concrete_worker", 4.3, 340, "N.R. Mohalla", 5, False),
        ("Bharat Yadav", "roofer", 4.5, 380, "Siddharthanagar", 8, True),
        # Home Services
        ("Sunita Devi", "house_cleaner", 4.8, 200, "Yelwal", 6, True),
        ("Meena Kumari", "cook", 4.9, 350, "Gokulam", 10, True),
        ("Priya Nair", "babysitter", 4.7, 250, "Jayalakshmipuram", 4, True),
        ("Ramesh Babu", "caretaker", 4.5, 280, "Vijayanagar", 7, True),
        ("Gopal Mishra", "gardener", 4.6, 220, "Kuvempunagar", 9, True),
        ("Kiran Sahu", "pest_control", 4.4, 400, "J.P. Nagar", 5, False),
        # Transport & Moving
        ("Dinesh Pal", "loader", 4.3, 250, "Saraswathipuram", 3, True),
        ("Ajay Thakur", "mover", 4.6, 300, "Hebbal", 6, True),
        ("Rahul Das", "delivery", 4.5, 200, "N.R. Mohalla", 2, True),
        ("Vijay Chauhan", "driver", 4.8, 350, "Siddharthanagar", 10, True),
        # Skilled Technical
        ("Deepak Joshi", "ac_technician", 4.8, 450, "Yelwal", 10, True),
        ("Arun Nair", "fridge_technician", 4.4, 400, "Gokulam", 7, True),
        ("Naveen Reddy", "washing_technician", 4.5, 380, "Jayalakshmipuram", 5, True),
        ("Sanjay Pandey", "mobile_technician", 4.7, 300, "Vijayanagar", 6, True),
        ("Rohit Saxena", "computer_technician", 4.6, 450, "Kuvempunagar", 8, True),
        # Agriculture & Outdoor
        ("Lakshman Gowda", "farm_worker", 4.3, 200, "J.P. Nagar", 15, True),
        ("Mohan Prajapati", "harvester", 4.2, 220, "Saraswathipuram", 12, True),
        ("Harish Naik", "irrigation", 4.4, 250, "Hebbal", 8, False),
        ("Jagdish Meena", "dairy_worker", 4.5, 230, "N.R. Mohalla", 10, True),
        # Industrial
        ("Pankaj Dubey", "factory_worker", 4.3, 280, "Siddharthanagar", 6, True),
        ("Sunil Yadav", "machine_operator", 4.6, 380, "Yelwal", 9, True),
        ("Kamal Jain", "packaging_worker", 4.2, 200, "Gokulam", 3, True),
        ("Raju Mandal", "warehouse_worker", 4.4, 250, "Jayalakshmipuram", 5, False),
        # Event & Temporary
        ("Nitin Kulkarni", "event_setup", 4.5, 300, "Vijayanagar", 5, True),
        ("Anand Pillai", "decorator", 4.8, 400, "Kuvempunagar", 8, True),
        ("Farhan Sheikh", "sound_light", 4.6, 450, "J.P. Nagar", 7, True),
        ("Balraj Chauhan", "security_guard", 4.4, 250, "Saraswathipuram", 10, True),
    ]

    for i, (name, skill, rating, price, city, exp, avail) in enumerate(workers_data, 1):
        email = f"{name.lower().replace(' ', '.')}@gmail.com"
        price = max(price, 500)  # Minimum price ₹500
        user = User.objects.create_user(
            email=email,
            password="password123",
            name=name,
            phone=f"98765{i:05d}",
            is_worker=True,
            city=city,
            address=f"Street {i}, {city}",
            pincode="560001",
        )
        Worker.objects.create(
            user=user,
            skill=skill,
            experience=exp,
            rating=Decimal(str(rating)),
            price_per_hour=Decimal(str(price)),
            availability=avail,
        )
        print(f"  - {name} ({skill}) — Rs {price}/hr")

    # ── STEP 3: Create Tools (matching dummyData.js) ──
    print("\n[3/3] Creating 50 tools...")

    tools_data = [
        # Construction Tools
        ("Hammer", "Construction Tools", 50, "https://images.unsplash.com/photo-1586864387789-628af9feed72?w=400&h=300&fit=crop", True),
        ("Drill Machine", "Construction Tools", 200, "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop", True),
        ("Measuring Tape", "Construction Tools", 30, "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop", True),
        ("Spirit Level", "Construction Tools", 40, "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop", True),
        ("Trowel", "Construction Tools", 25, "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop", True),
        # Electrical Tools
        ("Wire Stripper", "Electrical Tools", 40, "https://images.unsplash.com/photo-1530124566582-a45a7e3f3517?w=400&h=300&fit=crop", True),
        ("Multimeter", "Electrical Tools", 80, "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop", True),
        ("Voltage Tester", "Electrical Tools", 35, "https://images.unsplash.com/photo-1515879218367-8466d910adef?w=400&h=300&fit=crop", True),
        ("Soldering Iron", "Electrical Tools", 60, "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop", True),
        # Plumbing Tools
        ("Pipe Wrench", "Plumbing Tools", 50, "https://images.unsplash.com/photo-1586864387789-628af9feed72?w=400&h=300&fit=crop", True),
        ("Plunger", "Plumbing Tools", 20, "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop", True),
        ("Pipe Cutter", "Plumbing Tools", 70, "https://images.unsplash.com/photo-1530124566582-a45a7e3f3517?w=400&h=300&fit=crop", True),
        ("Drain Snake", "Plumbing Tools", 100, "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop", True),
        # Carpentry Tools
        ("Hand Saw", "Carpentry Tools", 40, "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop", True),
        ("Circular Saw", "Carpentry Tools", 350, "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop", True),
        ("Chisel Set", "Carpentry Tools", 60, "https://images.unsplash.com/photo-1586864387789-628af9feed72?w=400&h=300&fit=crop", True),
        ("Wood Planer", "Carpentry Tools", 250, "https://images.unsplash.com/photo-1530124566582-a45a7e3f3517?w=400&h=300&fit=crop", True),
        # Painting Tools
        ("Paint Roller", "Painting Tools", 30, "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop", True),
        ("Paint Brush Set", "Painting Tools", 25, "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop", True),
        ("Spray Gun", "Painting Tools", 300, "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop", True),
        ("Ladder (20ft)", "Painting Tools", 150, "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop", True),
        # Gardening Tools
        ("Lawn Mower", "Gardening Tools", 400, "https://images.unsplash.com/photo-1530124566582-a45a7e3f3517?w=400&h=300&fit=crop", True),
        ("Hedge Trimmer", "Gardening Tools", 200, "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop", True),
        ("Shovel", "Gardening Tools", 30, "https://images.unsplash.com/photo-1586864387789-628af9feed72?w=400&h=300&fit=crop", True),
        ("Rake", "Gardening Tools", 25, "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop", True),
        # General Tools
        ("Screwdriver Set", "General Tools", 40, "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop", True),
        ("Allen Key Set", "General Tools", 30, "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop", True),
        ("Pliers", "General Tools", 25, "https://images.unsplash.com/photo-1530124566582-a45a7e3f3517?w=400&h=300&fit=crop", True),
        ("Spanner Set", "General Tools", 50, "https://images.unsplash.com/photo-1586864387789-628af9feed72?w=400&h=300&fit=crop", True),
        # Power Tools
        ("Angle Grinder", "Power Tools", 250, "https://images.unsplash.com/photo-1530124566582-a45a7e3f3517?w=400&h=300&fit=crop", True),
        ("Impact Wrench", "Power Tools", 300, "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop", True),
        ("Power Drill", "Power Tools", 200, "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop", True),
        ("Chainsaw", "Power Tools", 500, "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop", True),
        ("Air Compressor", "Power Tools", 450, "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop", True),
        # Agriculture Machines
        ("Tractor", "Agriculture Machines", 3000, "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&h=300&fit=crop", True),
        ("Rotavator", "Agriculture Machines", 1500, "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop", True),
        ("Seed Drill Machine", "Agriculture Machines", 1200, "https://images.unsplash.com/photo-1530124566582-a45a7e3f3517?w=400&h=300&fit=crop", True),
        ("Harvester", "Agriculture Machines", 5000, "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&h=300&fit=crop", False),
        ("Thresher", "Agriculture Machines", 2000, "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop", True),
        # Construction Machines
        ("JCB (Excavator)", "Construction Machines", 8000, "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop", True),
        ("Bulldozer", "Construction Machines", 10000, "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&h=300&fit=crop", False),
        ("Backhoe Loader", "Construction Machines", 7000, "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop", True),
        ("Mini Excavator", "Construction Machines", 5000, "https://images.unsplash.com/photo-1530124566582-a45a7e3f3517?w=400&h=300&fit=crop", True),
        ("Crane", "Construction Machines", 15000, "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?w=400&h=300&fit=crop", True),
        ("Road Roller", "Construction Machines", 6000, "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop", True),
        ("Concrete Mixer Machine", "Construction Machines", 800, "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop", True),
        # Irrigation Equipment
        ("Water Pump", "Irrigation Equipment", 400, "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop", True),
        ("Sprinkler System", "Irrigation Equipment", 300, "https://images.unsplash.com/photo-1530124566582-a45a7e3f3517?w=400&h=300&fit=crop", True),
        ("Drip Irrigation Kit", "Irrigation Equipment", 250, "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop", True),
        ("Hose Pipe (100ft)", "Irrigation Equipment", 50, "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&h=300&fit=crop", True),
    ]

    for name, category, price, img, avail in tools_data:
        Tool.objects.create(
            name=name,
            description=f"Professional grade {name} for industrial and home use. Certified for safety and precision.",
            category=category,
            price_per_day=Decimal(str(price)),
            image_url=img,
            availability=avail,
        )
        print(f"  - {name} ({category}) — Rs {price}/day")

    # ── STEP 4: Create Default Customer User ──
    print("\n[4/4] Creating default customer...")
    if not User.objects.filter(email="demo@gmail.com").exists():
        User.objects.create_user(
            email="demo@gmail.com",
            password="password123",
            name="Demo Customer",
            phone="9876500000",
            is_worker=False,
            city="Mysore",
            address="NIE North Campus, Manandavadi Road, Mysore",
            pincode="570008",
        )
        print("  - demo@gmail.com created (Password: password123)")
    else:
        print("  - demo@gmail.com already exists.")

    # ── Summary ──
    print("\n" + "=" * 60)
    print(f"  - Workers: {Worker.objects.count()}")
    print(f"  - Tools:   {Tool.objects.count()}")
    print(f"  - Users:   {User.objects.count()}")
    print("=" * 60)
    print("  Seed complete! Frontend and backend are now in sync.")


if __name__ == "__main__":
    seed()
