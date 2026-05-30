"""
Seed script for ServiceLink V2 — synced with the new Upscaled frontend data.
Wipes old workers/tools and creates fresh data matching dummyData.js exactly.
"""
import os
import django
from decimal import Decimal

# Safely load local .env environment variables (zero-dependency)
for env_path in [".env", "../.env"]:
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        os.environ.setdefault(k.strip(), v.strip())
        except Exception:
            pass

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "servicelink.settings.development")
django.setup()

from apps.accounts.models import User
from apps.workers.models import Worker
from apps.tools.models import Tool
from apps.bookings.models import Booking
from django.db import transaction


@transaction.atomic
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

    # ── STEP 2: Create Workers (Programmatic coverage for all categories & locations) ──
    print("\n[2/3] Generating workers for all service-location combinations...")

    locations = [
        "Gokulam", "Jayalakshmipuram", "Vijayanagar", "Kuvempunagar", 
        "J.P. Nagar", "Saraswathipuram", "Hebbal", "N.R. Mohalla", 
        "Siddharthanagar", "Yelwal"
    ]

    service_hierarchy = {
        "Electrician & Appliances": [
            "Electrician", "AC technician", "Refrigerator technician", 
            "Washing machine technician", "Mobile repair technician", 
            "Computer technician", "Sound/Light Technician"
        ],
        "Construction & Repair": [
            "Mason", "Carpenter", "Plumber", "Welder", "Painter", 
            "Tile worker", "Roofer", "Concrete Worker"
        ],
        "Home & Care": [
            "House cleaner", "Cook", "Babysitter", "Caretaker", 
            "Gardener", "Pest control worker"
        ],
        "Transport & Moving": [
            "Driver", "Delivery worker", "Loader / Unloader", 
            "House shifting worker", "Mover"
        ],
        "Agriculture & Outdoor": [
            "Farm worker", "Tractor operator", "Harvester operator", 
            "Irrigation worker", "Pesticide sprayer", "Dairy worker"
        ],
        "Industrial & Events": [
            "Factory worker", "Machine operator", "Warehouse worker", 
            "Security guard", "Event setup worker", "Decorator", "Packaging Worker"
        ]
    }

    # Define pricing ranges for each skill (Mysore semi-urban rates)
    skill_pricing = {
        "Electrician": (150, 250),
        "AC technician": (300, 500),
        "Refrigerator technician": (200, 350),
        "Washing machine technician": (200, 350),
        "Mobile repair technician": (200, 350),
        "Computer technician": (200, 350),
        "Sound/Light Technician": (250, 400),
        "Mason": (450, 650),
        "Carpenter": (400, 600),
        "Plumber": (120, 200),
        "Welder": (300, 450),
        "Painter": (350, 500),
        "Tile worker": (350, 500),
        "Roofer": (400, 600),
        "Concrete Worker": (400, 600),
        "House cleaner": (85, 170),
        "Cook": (125, 250),
        "Babysitter": (100, 200),
        "Caretaker": (200, 330),
        "Gardener": (65, 125),
        "Pest control worker": (150, 250),
        "Driver": (500, 800),
        "Delivery worker": (200, 350),
        "Loader / Unloader": (150, 250),
        "House shifting worker": (300, 500),
        "Mover": (300, 500),
        "Farm worker": (100, 200),
        "Tractor operator": (400, 600),
        "Harvester operator": (500, 800),
        "Irrigation worker": (100, 200),
        "Pesticide sprayer": (150, 250),
        "Dairy worker": (100, 200),
        "Factory worker": (200, 350),
        "Machine operator": (300, 450),
        "Warehouse worker": (200, 350),
        "Security guard": (290, 420),
        "Event setup worker": (250, 400),
        "Decorator": (300, 500),
        "Packaging Worker": (150, 250),
    }

    # Common names for generation
    first_names = ["Arjun", "Bala", "Chetan", "Deepak", "Eshwar", "Farhan", "Ganesh", "Hari", "Irfan", "Jatin", "Kiran", "Lokesh", "Manoj", "Nitin", "Om", "Pankaj", "Rahul", "Suresh", "Tarun", "Umesh", "Vijay", "Wasim", "Yuvraj", "Zaid"]
    last_names = ["Kumar", "Patel", "Sharma", "Singh", "Yadav", "Nair", "Reddy", "Gowda", "Verma", "Pandey", "Joshi", "Das", "Thakur", "Mishra", "Gupta", "Sahu"]

    import random
    
    worker_count = 0
    for loc_idx, location in enumerate(locations):
        for cat_name, skills in service_hierarchy.items():
            for skill_idx, skill in enumerate(skills):
                worker_count += 1
                
                # Generate a unique name
                fname = first_names[(loc_idx + skill_idx) % len(first_names)]
                lname = last_names[(worker_count) % len(last_names)]
                name = f"{fname} {lname}"
                
                email = f"{fname.lower()}.{lname.lower()}.{worker_count}@servicelink.com"
                
                # Randomized but realistic stats
                rating = round(random.uniform(4.2, 5.0), 1)
                # Get pricing range for the skill
                price_range = skill_pricing.get(skill, (200, 400))
                price = random.randint(price_range[0], price_range[1])
                exp = random.randint(2, 15)
                
                user = User.objects.create_user(
                    email=email,
                    password="password123",
                    name=name,
                    phone=f"9{worker_count:09d}"[:10], # Generate 10-digit number
                    is_worker=True,
                    city=location,
                    address=f"Building {worker_count}, {location} Main Rd",
                    pincode=f"5700{10+loc_idx}",
                )
                
                Worker.objects.create(
                    user=user,
                    skill=skill,
                    experience=exp,
                    rating=Decimal(str(rating)),
                    price_per_hour=Decimal(str(price)),
                    availability=True,
                )
                
    print(f"  - Successfully generated {worker_count} workers across {len(locations)} locations.")

    # ── STEP 2.5: Create Dedicated Demo Workers with easy-to-remember emails ──
    print("\nCreating easy-to-remember demo worker accounts...")
    demo_workers = [
        ("Edward Sparks", "electrician@demo.com", "Electrician", "Gokulam", 4.9, 200, 8),
        ("Peter Pipe", "plumber@demo.com", "Plumber", "Jayalakshmipuram", 4.8, 150, 5),
        ("David Drive", "driver@demo.com", "Driver", "Vijayanagar", 4.7, 600, 10),
        ("Claire Clean", "cleaner@demo.com", "House cleaner", "Kuvempunagar", 4.9, 120, 4),
        ("Chris Carpenter", "carpenter@demo.com", "Carpenter", "J.P. Nagar", 4.6, 450, 6)
    ]
    for idx, (name, email, skill, city, rating, price, exp) in enumerate(demo_workers):
        user = User.objects.create_user(
            email=email,
            password="password123",
            name=name,
            phone=f"999900000{idx}",
            is_worker=True,
            city=city,
            address=f"Demo Street, {city}",
            pincode="570002",
        )
        Worker.objects.create(
            user=user,
            skill=skill,
            experience=exp,
            rating=Decimal(str(rating)),
            price_per_hour=Decimal(str(price)),
            availability=True,
        )

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
        # Extra
        ("Karcher Pressure Washer", "Power Tools", 500, "/images/karcher_pressure_washer.png", True),
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
