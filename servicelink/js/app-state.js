// Labourgrid / ServiceLink - shared mock state for the user-side flow

const AppState = {
  keys: {
    user: 'labourgrid_current_user',
    selectedItem: 'labourgrid_selected_item',
    bookingDraft: 'labourgrid_booking_draft',
    bookings: 'labourgrid_bookings',
    profile: 'labourgrid_profile',
    legacySession: 'servicelink_session',
    legacyBookings: 'servicelink_bookings',
    legacyWorker: 'selected_worker',
    legacyTool: 'selected_tool'
  },

  workers: [
    {
      id: 'w1',
      name: 'Rajesh Kumar',
      skill: 'Plumbing',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&auto=format',
      rating: 4.9,
      reviews: 127,
      location: 'Indiranagar, Bengaluru',
      availability: 'available',
      hourlyRate: 450,
      experience: '8 years',
      completedJobs: 342,
      bio: 'Licensed plumber for leak repairs, bathroom fittings, water heaters, and urgent home fixes.',
      skills: ['Pipe Repair', 'Drain Cleaning', 'Water Heater', 'Bathroom Fittings']
    },
    {
      id: 'w2',
      name: 'Maria Fernandes',
      skill: 'Electrical',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&auto=format',
      rating: 4.9,
      reviews: 89,
      location: 'Koramangala, Bengaluru',
      availability: 'available',
      hourlyRate: 550,
      experience: '12 years',
      completedJobs: 256,
      bio: 'Certified electrician for wiring, lighting, panel checks, inverter setup, and troubleshooting.',
      skills: ['Wiring', 'Lighting', 'Panel Upgrades', 'Troubleshooting']
    },
    {
      id: 'w3',
      name: 'David Chen',
      skill: 'Carpentry',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&auto=format',
      rating: 4.7,
      reviews: 156,
      location: 'Whitefield, Bengaluru',
      availability: 'busy',
      hourlyRate: 500,
      experience: '6 years',
      completedJobs: 189,
      bio: 'Custom furniture, shelves, repair work, door alignment, and home renovation support.',
      skills: ['Custom Furniture', 'Cabinetry', 'Flooring', 'Door Repair']
    },
    {
      id: 'w4',
      name: 'Sarah Johnson',
      skill: 'Cleaning',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&auto=format',
      rating: 4.8,
      reviews: 234,
      location: 'HSR Layout, Bengaluru',
      availability: 'available',
      hourlyRate: 300,
      experience: '5 years',
      completedJobs: 567,
      bio: 'Professional deep cleaning for apartments, kitchens, bathrooms, offices, and move-in homes.',
      skills: ['Deep Cleaning', 'Kitchen Cleaning', 'Move-in/out', 'Office Cleaning']
    },
    {
      id: 'w5',
      name: 'Michael Brown',
      skill: 'HVAC',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&auto=format',
      rating: 4.6,
      reviews: 78,
      location: 'Jayanagar, Bengaluru',
      availability: 'available',
      hourlyRate: 650,
      experience: '15 years',
      completedJobs: 412,
      bio: 'AC service, cooling diagnostics, gas refill coordination, duct cleaning, and maintenance.',
      skills: ['AC Repair', 'Maintenance', 'Duct Cleaning', 'Cooling Issues']
    },
    {
      id: 'w6',
      name: 'Lisa Wong',
      skill: 'Painting',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&auto=format',
      rating: 4.8,
      reviews: 112,
      location: 'Malleshwaram, Bengaluru',
      availability: 'busy',
      hourlyRate: 420,
      experience: '7 years',
      completedJobs: 298,
      bio: 'Interior and exterior painting with careful masking, clean finish, and color consultation.',
      skills: ['Interior Painting', 'Exterior Painting', 'Texture Paint', 'Staining']
    }
  ],

  tools: [
    {
      id: 't1',
      name: 'Bosch Cordless Drill Set',
      category: 'Power Tools',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&h=420&fit=crop&auto=format',
      pricePerDay: 350,
      pricePerWeek: 2100,
      stock: 5,
      availability: 'available',
      rating: 4.8,
      reviews: 45,
      description: 'Professional 20V cordless drill with multiple bits, spare battery, charger, and carrying case.',
      features: ['20V Battery', '2 Speed Settings', 'LED Light', 'Carrying Case']
    },
    {
      id: 't2',
      name: 'Extension Ladder 24ft',
      category: 'Ladders',
      image: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=600&h=420&fit=crop&auto=format',
      pricePerDay: 500,
      pricePerWeek: 3000,
      stock: 3,
      availability: 'available',
      rating: 4.7,
      reviews: 32,
      description: 'Heavy-duty aluminum extension ladder suitable for exterior work and ceiling-height repairs.',
      features: ['24ft Max Height', '300lb Capacity', 'Slip-resistant Feet', 'Lightweight Aluminum']
    },
    {
      id: 't3',
      name: 'Pressure Washer',
      category: 'Cleaning',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=420&fit=crop&auto=format',
      pricePerDay: 700,
      pricePerWeek: 4200,
      stock: 2,
      availability: 'limited',
      rating: 4.9,
      reviews: 78,
      description: 'High-pressure washer for driveways, balconies, decks, grills, and exterior cleaning jobs.',
      features: ['3000 PSI', '2.4 GPM', '25ft Hose', 'Multiple Nozzles']
    },
    {
      id: 't4',
      name: 'Wet/Dry Vacuum',
      category: 'Cleaning',
      image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&h=420&fit=crop&auto=format',
      pricePerDay: 450,
      pricePerWeek: 2700,
      stock: 4,
      availability: 'available',
      rating: 4.6,
      reviews: 56,
      description: '16-gallon wet and dry vacuum for renovation cleanup, spills, dust, and workshop use.',
      features: ['16 Gallon Tank', '6.5 HP Motor', 'Blower Function', 'Multiple Attachments']
    },
    {
      id: 't5',
      name: 'Circular Saw',
      category: 'Power Tools',
      image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=600&h=420&fit=crop&auto=format',
      pricePerDay: 420,
      pricePerWeek: 2500,
      stock: 6,
      availability: 'available',
      rating: 4.7,
      reviews: 41,
      description: 'Professional circular saw for wood cuts, furniture work, plywood, and renovation tasks.',
      features: ['7-1/4 Inch Blade', '15 Amp Motor', 'Laser Guide', 'Dust Blower']
    },
    {
      id: 't6',
      name: 'Floor Sander',
      category: 'Flooring',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=420&fit=crop&auto=format',
      pricePerDay: 850,
      pricePerWeek: 5100,
      stock: 1,
      availability: 'limited',
      rating: 4.5,
      reviews: 23,
      description: 'Drum floor sander for hardwood floor refinishing with dust collection support.',
      features: ['Drum Sander', 'Dust Collection', 'Variable Speed', 'Starter Sandpaper']
    }
  ],

  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  },

  init() {
    if (!this.get(this.keys.user)) {
      const legacy = this.get(this.keys.legacySession);
      if (legacy) this.set(this.keys.user, legacy);
    }

    const newBookings = this.get(this.keys.bookings);
    const legacyBookings = this.get(this.keys.legacyBookings, []);
    if (!newBookings && legacyBookings.length) {
      this.set(this.keys.bookings, legacyBookings.map((booking) => this.normalizeBooking(booking)));
    }
  },

  currentUser() {
    this.init();
    return this.get(this.keys.user);
  },

  isLoggedIn() {
    return Boolean(this.get(this.keys.user));
  },

  setUser(user) {
    const savedUser = this.set(this.keys.user, user);
    this.set(this.keys.legacySession, user);
    return savedUser;
  },

  logout() {
    localStorage.removeItem(this.keys.user);
    localStorage.removeItem(this.keys.legacySession);
  },

  profile() {
    const user = this.currentUser();
    const savedProfile = this.get(this.keys.profile, {});
    return {
      fullName: savedProfile.fullName || user?.name || '',
      phone: savedProfile.phone || user?.phone || '',
      email: savedProfile.email || user?.email || '',
      address: savedProfile.address || '',
      city: savedProfile.city || '',
      pincode: savedProfile.pincode || ''
    };
  },

  saveProfile(profile) {
    const normalized = {
      fullName: (profile.fullName || '').trim(),
      phone: (profile.phone || '').trim(),
      email: (profile.email || '').trim(),
      address: (profile.address || '').trim(),
      city: (profile.city || '').trim(),
      pincode: (profile.pincode || '').trim()
    };
    this.set(this.keys.profile, normalized);

    const user = this.currentUser();
    if (user) {
      this.setUser({
        ...user,
        name: normalized.fullName || user.name,
        phone: normalized.phone || user.phone,
        email: normalized.email || user.email,
        location: normalized.city || user.location
      });
    }

    return normalized;
  },

  isProfileComplete(profile = this.profile()) {
    return ['fullName', 'phone', 'email', 'address', 'city', 'pincode']
      .every((key) => Boolean((profile[key] || '').trim()));
  },

  allItems() {
    return [
      ...this.workers.map((item) => ({ ...item, type: 'service' })),
      ...this.tools.map((item) => ({ ...item, type: 'tool' }))
    ];
  },

  findWorker(id) {
    return this.workers.find((worker) => worker.id === id);
  },

  findTool(id) {
    return this.tools.find((tool) => tool.id === id);
  },

  findItem(type, id) {
    return type === 'tool' ? this.findTool(id) : this.findWorker(id);
  },

  selectItem(type, item) {
    const payload = { type, item };
    this.set(this.keys.selectedItem, payload);
    if (type === 'tool') {
      this.set(this.keys.legacyTool, item);
    } else {
      this.set(this.keys.legacyWorker, item);
    }
    return payload;
  },

  selectedItem() {
    return this.get(this.keys.selectedItem);
  },

  bookings() {
    this.init();
    return this.get(this.keys.bookings, []).map((booking) => this.normalizeBooking(booking));
  },

  saveBooking(booking) {
    const bookings = this.bookings();
    bookings.unshift(this.normalizeBooking(booking));
    this.set(this.keys.bookings, bookings);
    this.set(this.keys.legacyBookings, bookings);
    return booking;
  },

  updateBookingStatus(id, status) {
    const bookings = this.bookings().map((booking) => (
      booking.id === id ? { ...booking, status } : booking
    ));
    this.set(this.keys.bookings, bookings);
    this.set(this.keys.legacyBookings, bookings);
    return bookings;
  },

  normalizeBooking(booking) {
    const item = booking.item || {};
    const isTool = booking.type === 'tool';
    return {
      id: booking.id || `book_${Date.now()}`,
      type: booking.type || 'service',
      itemId: booking.itemId || item.id || '',
      itemName: booking.itemName || item.name || 'Booking',
      image: booking.image || item.image || item.avatar || '',
      category: booking.category || item.category || item.skill || '',
      date: booking.date || '',
      time: booking.time || '',
      location: booking.location || booking.address || {
        address: booking.address?.street || '',
        city: booking.address?.city || '',
        pincode: booking.address?.zip || ''
      },
      price: booking.price || booking.totalPrice || 0,
      status: booking.status === 'accepted' ? 'confirmed' : (booking.status || 'pending'),
      createdAt: booking.createdAt || new Date().toISOString(),
      pricingUnit: isTool ? 'day' : 'hour',
      notes: booking.notes || ''
    };
  },

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(amount) || 0);
  },

  formatDate(date) {
    if (!date) return 'Not selected';
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(new Date(date));
  }
};

AppState.init();
window.AppState = AppState;
