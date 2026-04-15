// ServiceLink - Filters Module

/**
 * Filter System for Workers and Tools
 */
const Filters = {
  state: {
    workers: [],
    tools: [],
    filters: {
      workers: {
        skill: '',
        location: '',
        availability: '',
        rating: 0,
        search: ''
      },
      tools: {
        category: '',
        minPrice: 0,
        maxPrice: 1000,
        availability: '',
        search: ''
      }
    }
  },
  
  init(type = 'workers') {
    this.type = type;
    this.loadMockData();
    this.bindEvents();
    this.render();
  },
  
  loadMockData() {
    // Mock Workers Data
    this.state.workers = [
      {
        id: 'w1',
        name: 'John Smith',
        skill: 'Plumbing',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        rating: 4.8,
        reviews: 127,
        location: 'Manhattan, NY',
        availability: 'available',
        hourlyRate: 65,
        experience: '8 years',
        completedJobs: 342,
        bio: 'Licensed plumber specializing in residential repairs and installations.',
        skills: ['Pipe Repair', 'Drain Cleaning', 'Water Heater', 'Bathroom Remodel']
      },
      {
        id: 'w2',
        name: 'Maria Garcia',
        skill: 'Electrical',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
        rating: 4.9,
        reviews: 89,
        location: 'Brooklyn, NY',
        availability: 'available',
        hourlyRate: 75,
        experience: '12 years',
        completedJobs: 256,
        bio: 'Certified electrician for all your home electrical needs.',
        skills: ['Wiring', 'Panel Upgrades', 'Lighting', 'Troubleshooting']
      },
      {
        id: 'w3',
        name: 'David Chen',
        skill: 'Carpentry',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
        rating: 4.7,
        reviews: 156,
        location: 'Queens, NY',
        availability: 'busy',
        hourlyRate: 60,
        experience: '6 years',
        completedJobs: 189,
        bio: 'Custom furniture and home renovation specialist.',
        skills: ['Custom Furniture', 'Cabinetry', 'Flooring', 'Deck Building']
      },
      {
        id: 'w4',
        name: 'Sarah Johnson',
        skill: 'Cleaning',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
        rating: 4.9,
        reviews: 234,
        location: 'Manhattan, NY',
        availability: 'available',
        hourlyRate: 35,
        experience: '5 years',
        completedJobs: 567,
        bio: 'Professional cleaning services for homes and offices.',
        skills: ['Deep Cleaning', 'Move-in/out', 'Office Cleaning', 'Organizing']
      },
      {
        id: 'w5',
        name: 'Michael Brown',
        skill: 'HVAC',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
        rating: 4.6,
        reviews: 78,
        location: 'Bronx, NY',
        availability: 'available',
        hourlyRate: 85,
        experience: '15 years',
        completedJobs: 412,
        bio: 'Heating and cooling expert with 15+ years experience.',
        skills: ['AC Repair', 'Heating', 'Duct Cleaning', 'Maintenance']
      },
      {
        id: 'w6',
        name: 'Lisa Wong',
        skill: 'Painting',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
        rating: 4.8,
        reviews: 112,
        location: 'Brooklyn, NY',
        availability: 'busy',
        hourlyRate: 50,
        experience: '7 years',
        completedJobs: 298,
        bio: 'Interior and exterior painting with attention to detail.',
        skills: ['Interior Painting', 'Exterior Painting', 'Wallpaper', 'Staining']
      },
      {
        id: 'w7',
        name: 'Robert Taylor',
        skill: 'Moving',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
        rating: 4.7,
        reviews: 189,
        location: 'Queens, NY',
        availability: 'available',
        hourlyRate: 55,
        experience: '10 years',
        completedJobs: 445,
        bio: 'Reliable moving services for local and long-distance moves.',
        skills: ['Local Moving', 'Packing', 'Furniture Assembly', 'Storage']
      },
      {
        id: 'w8',
        name: 'Emily Davis',
        skill: 'Gardening',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
        rating: 4.9,
        reviews: 67,
        location: 'Staten Island, NY',
        availability: 'available',
        hourlyRate: 45,
        experience: '4 years',
        completedJobs: 134,
        bio: 'Landscaping and garden maintenance services.',
        skills: ['Lawn Care', 'Planting', 'Pruning', 'Landscape Design']
      }
    ];
    
    // Mock Tools Data
    this.state.tools = [
      {
        id: 't1',
        name: 'Cordless Drill Set',
        category: 'Power Tools',
        image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
        pricePerDay: 25,
        pricePerWeek: 140,
        stock: 5,
        availability: 'available',
        rating: 4.8,
        reviews: 45,
        description: 'Professional 20V cordless drill with multiple bits and carrying case.',
        features: ['20V Battery', '2 Speed Settings', 'LED Light', 'Carrying Case']
      },
      {
        id: 't2',
        name: 'Extension Ladder 24ft',
        category: 'Ladders',
        image: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400&h=300&fit=crop',
        pricePerDay: 35,
        pricePerWeek: 200,
        stock: 3,
        availability: 'available',
        rating: 4.7,
        reviews: 32,
        description: 'Heavy-duty aluminum extension ladder, perfect for exterior work.',
        features: ['24ft Max Height', '300lb Capacity', 'Slip-resistant', 'Lightweight']
      },
      {
        id: 't3',
        name: 'Pressure Washer',
        category: 'Cleaning',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        pricePerDay: 45,
        pricePerWeek: 280,
        stock: 2,
        availability: 'limited',
        rating: 4.9,
        reviews: 78,
        description: 'High-pressure washer for decks, driveways, and exterior cleaning.',
        features: ['3000 PSI', '2.4 GPM', '25ft Hose', 'Multiple Nozzles']
      },
      {
        id: 't4',
        name: 'Wet/Dry Vacuum',
        category: 'Cleaning',
        image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=300&fit=crop',
        pricePerDay: 30,
        pricePerWeek: 175,
        stock: 4,
        availability: 'available',
        rating: 4.6,
        reviews: 56,
        description: '16-gallon wet/dry vacuum for heavy-duty cleanup.',
        features: ['16 Gallon', '6.5 HP Motor', 'Blower Function', 'Multiple Attachments']
      },
      {
        id: 't5',
        name: 'Circular Saw',
        category: 'Power Tools',
        image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&h=300&fit=crop',
        pricePerDay: 28,
        pricePerWeek: 160,
        stock: 6,
        availability: 'available',
        rating: 4.7,
        reviews: 41,
        description: 'Professional circular saw for precise cuts.',
        features: ['7-1/4 Inch Blade', '15 Amp Motor', 'Laser Guide', 'Dust Blower']
      },
      {
        id: 't6',
        name: 'Floor Sander',
        category: 'Flooring',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop',
        pricePerDay: 55,
        pricePerWeek: 330,
        stock: 1,
        availability: 'limited',
        rating: 4.5,
        reviews: 23,
        description: 'Drum floor sander for hardwood floor refinishing.',
        features: ['Drum Sander', 'Dust Collection', 'Variable Speed', 'Sanding Papers Included']
      },
      {
        id: 't7',
        name: 'Tile Cutter',
        category: 'Tiling',
        image: 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=400&h=300&fit=crop',
        pricePerDay: 32,
        pricePerWeek: 185,
        stock: 3,
        availability: 'available',
        rating: 4.4,
        reviews: 19,
        description: 'Professional wet tile saw for precise cuts.',
        features: ['10 Inch Blade', 'Water Cooling', '45° Miter Cut', 'Rip Fence']
      },
      {
        id: 't8',
        name: 'Scaffolding Set',
        category: 'Scaffolding',
        image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=300&fit=crop',
        pricePerDay: 75,
        pricePerWeek: 450,
        stock: 2,
        availability: 'available',
        rating: 4.8,
        reviews: 34,
        description: 'Complete scaffolding set for safe elevated work.',
        features: ['1000lb Capacity', 'Adjustable Height', 'Guard Rails', 'Locking Wheels']
      }
    ];
  },
  
  bindEvents() {
    // Filter inputs
    const filterInputs = document.querySelectorAll('[data-filter]');
    filterInputs.forEach(input => {
      input.addEventListener('change', (e) => this.handleFilterChange(e));
      input.addEventListener('input', debounce((e) => this.handleFilterChange(e), 300));
    });
    
    // Clear filters
    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearFilters());
    }
    
    // Sort
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => this.handleSort(e));
    }
  },
  
  handleFilterChange(e) {
    const { filter, type } = e.target.dataset;
    const value = e.target.value;
    
    if (type) {
      this.state.filters[type][filter] = value;
    } else {
      this.state.filters[this.type][filter] = value;
    }
    
    this.render();
  },
  
  handleSort(e) {
    const sortBy = e.target.value;
    this.sortBy = sortBy;
    this.render();
  },
  
  clearFilters() {
    this.state.filters[this.type] = {
      skill: '',
      location: '',
      availability: '',
      rating: 0,
      search: '',
      category: '',
      minPrice: 0,
      maxPrice: 1000
    };
    
    // Reset form inputs
    document.querySelectorAll('[data-filter]').forEach(input => {
      if (input.type === 'select-one') {
        input.value = '';
      } else if (input.type === 'range') {
        input.value = input.max || 1000;
      } else {
        input.value = '';
      }
    });
    
    this.render();
    Toast.info('Filters cleared');
  },
  
  getFilteredData() {
    const data = this.type === 'workers' ? this.state.workers : this.state.tools;
    const filters = this.state.filters[this.type];
    
    return data.filter(item => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = this.type === 'workers' 
          ? `${item.name} ${item.skill} ${item.bio}`.toLowerCase()
          : `${item.name} ${item.category} ${item.description}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }
      
      if (this.type === 'workers') {
        // Skill filter
        if (filters.skill && item.skill !== filters.skill) return false;
        
        // Location filter
        if (filters.location && !item.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
        
        // Availability filter
        if (filters.availability && item.availability !== filters.availability) return false;
        
        // Rating filter
        if (filters.rating && item.rating < parseFloat(filters.rating)) return false;
      } else {
        // Category filter
        if (filters.category && item.category !== filters.category) return false;
        
        // Price filter
        if (item.pricePerDay < filters.minPrice || item.pricePerDay > filters.maxPrice) return false;
        
        // Availability filter
        if (filters.availability && item.availability !== filters.availability) return false;
      }
      
      return true;
    });
  },
  
  getSortedData(data) {
    if (!this.sortBy) return data;
    
    const sorted = [...data];
    
    switch (this.sortBy) {
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        sorted.sort((a, b) => (a.hourlyRate || a.pricePerDay) - (b.hourlyRate || b.pricePerDay));
        break;
      case 'price-high':
        sorted.sort((a, b) => (b.hourlyRate || b.pricePerDay) - (a.hourlyRate || a.pricePerDay));
        break;
      case 'reviews':
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    
    return sorted;
  },
  
  render() {
    const container = document.getElementById(`${this.type}-grid`);
    const countEl = document.getElementById('results-count');
    
    if (!container) return;
    
    let data = this.getFilteredData();
    data = this.getSortedData(data);
    
    // Update count
    if (countEl) {
      countEl.textContent = `${data.length} result${data.length !== 1 ? 's' : ''}`;
    }
    
    // Show empty state if no results
    if (data.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <h3 class="empty-state-title">No results found</h3>
          <p class="empty-state-text">Try adjusting your filters or search criteria</p>
          <button class="btn btn-secondary" onclick="Filters.clearFilters()">Clear Filters</button>
        </div>
      `;
      return;
    }
    
    // Render cards
    container.innerHTML = data.map(item => 
      this.type === 'workers' ? this.renderWorkerCard(item) : this.renderToolCard(item)
    ).join('');
    
    // Bind card events
    this.bindCardEvents();
  },
  
  renderWorkerCard(worker) {
    const availabilityClass = worker.availability === 'available' ? 'badge-success' : 'badge-warning';
    const availabilityText = worker.availability === 'available' ? 'Available' : 'Busy';
    
    return `
      <div class="card card-hover worker-card" data-id="${worker.id}">
        <div class="worker-card-header">
          <img src="${worker.avatar}" alt="${worker.name}" class="worker-avatar">
          <div class="worker-status">
            <span class="badge ${availabilityClass}">${availabilityText}</span>
          </div>
        </div>
        <div class="worker-card-body">
          <h4 class="worker-name">${worker.name}</h4>
          <p class="worker-skill">${worker.skill}</p>
          <div class="rating">
            ${this.renderStars(worker.rating)}
            <span class="rating-text">${worker.rating} (${worker.reviews})</span>
          </div>
          <div class="worker-meta">
            <span class="worker-location">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              ${worker.location}
            </span>
            <span class="worker-rate">$${worker.hourlyRate}/hr</span>
          </div>
          <div class="worker-skills">
            ${worker.skills.slice(0, 3).map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </div>
        <div class="worker-card-footer">
          <button class="btn btn-secondary btn-sm btn-view-profile" data-id="${worker.id}">
            View Profile
          </button>
          <button class="btn btn-primary btn-sm btn-book-now" data-id="${worker.id}">
            Book Now
          </button>
        </div>
      </div>
    `;
  },
  
  renderToolCard(tool) {
    const availabilityClass = tool.availability === 'available' ? 'badge-success' : 'badge-warning';
    const availabilityText = tool.availability === 'available' ? 'In Stock' : 'Limited Stock';
    
    return `
      <div class="card card-hover tool-card" data-id="${tool.id}">
        <div class="tool-card-image">
          <img src="${tool.image}" alt="${tool.name}">
          <span class="badge ${availabilityClass} tool-availability">${availabilityText}</span>
        </div>
        <div class="tool-card-body">
          <span class="tool-category">${tool.category}</span>
          <h4 class="tool-name">${tool.name}</h4>
          <div class="rating">
            ${this.renderStars(tool.rating)}
            <span class="rating-text">${tool.rating}</span>
          </div>
          <p class="tool-description">${tool.description}</p>
          <div class="tool-pricing">
            <div class="price-day">
              <span class="price">$${tool.pricePerDay}</span>
              <span class="period">/day</span>
            </div>
            <div class="price-week">
              <span class="price">$${tool.pricePerWeek}</span>
              <span class="period">/week</span>
            </div>
          </div>
        </div>
        <div class="tool-card-footer">
          <button class="btn btn-primary btn-full btn-rent" data-id="${tool.id}">
            Rent Now
          </button>
        </div>
      </div>
    `;
  },
  
  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
      stars += '<svg class="rating-star" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }
    
    if (hasHalfStar) {
      stars += '<svg class="rating-star" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><defs><linearGradient id="half"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path fill="url(#half)" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars += '<svg class="rating-star" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
    }
    
    return stars;
  },
  
  bindCardEvents() {
    // View profile buttons
    document.querySelectorAll('.btn-view-profile').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.showWorkerProfile(id);
      });
    });
    
    // Book now buttons
    document.querySelectorAll('.btn-book-now').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const worker = this.state.workers.find(w => w.id === id);
        if (worker) {
          Storage.set('selected_worker', worker);
          window.location.href = 'booking.html?type=service';
        }
      });
    });
    
    // Rent now buttons
    document.querySelectorAll('.btn-rent').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const tool = this.state.tools.find(t => t.id === id);
        if (tool) {
          Storage.set('selected_tool', tool);
          window.location.href = 'booking.html?type=tool';
        }
      });
    });
  },
  
  showWorkerProfile(id) {
    const worker = this.state.workers.find(w => w.id === id);
    if (!worker) return;
    
    const availabilityClass = worker.availability === 'available' ? 'badge-success' : 'badge-warning';
    const availabilityText = worker.availability === 'available' ? 'Available Now' : 'Currently Busy';
    
    const content = `
      <div class="worker-profile-modal">
        <div class="worker-profile-header">
          <img src="${worker.avatar}" alt="${worker.name}" class="worker-profile-avatar">
          <div class="worker-profile-info">
            <h3>${worker.name}</h3>
            <p class="worker-profile-skill">${worker.skill}</p>
            <span class="badge ${availabilityClass}">${availabilityText}</span>
          </div>
        </div>
        <div class="worker-profile-stats">
          <div class="stat">
            <span class="stat-value">${worker.rating}</span>
            <span class="stat-label">Rating</span>
          </div>
          <div class="stat">
            <span class="stat-value">${worker.reviews}</span>
            <span class="stat-label">Reviews</span>
          </div>
          <div class="stat">
            <span class="stat-value">${worker.completedJobs}</span>
            <span class="stat-label">Jobs Done</span>
          </div>
          <div class="stat">
            <span class="stat-value">${worker.experience}</span>
            <span class="stat-label">Experience</span>
          </div>
        </div>
        <div class="worker-profile-section">
          <h4>About</h4>
          <p>${worker.bio}</p>
        </div>
        <div class="worker-profile-section">
          <h4>Skills</h4>
          <div class="worker-skills">
            ${worker.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>
        </div>
        <div class="worker-profile-section">
          <h4>Pricing</h4>
          <p class="worker-profile-price">$${worker.hourlyRate} <span>/ hour</span></p>
        </div>
        <div class="worker-profile-actions">
          <button class="btn btn-primary btn-lg btn-book-worker" data-id="${worker.id}">
            Book Now
          </button>
        </div>
      </div>
    `;
    
    const { overlay } = Modal.open(content, { title: 'Worker Profile', maxWidth: '500px' });
    
    overlay.querySelector('.btn-book-worker').addEventListener('click', () => {
      Storage.set('selected_worker', worker);
      window.location.href = 'booking.html?type=service';
    });
  }
};

// Initialize filters on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const workersGrid = document.getElementById('workers-grid');
  const toolsGrid = document.getElementById('tools-grid');
  
  if (workersGrid) {
    Filters.init('workers');
  } else if (toolsGrid) {
    Filters.init('tools');
  }
});
