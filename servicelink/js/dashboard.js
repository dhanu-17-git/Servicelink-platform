// ServiceLink - Dashboard Module

/**
 * User Dashboard - Manage Bookings
 */
const UserDashboard = {
  bookings: [],
  
  init() {
    // Check auth
    if (!Auth.requireAuth('login.html')) return;
    
    this.loadBookings();
    this.renderKPIs();
    this.renderBookings();
    this.bindEvents();
  },
  
  loadBookings() {
    this.bookings = Storage.get('servicelink_bookings', []);
    
    // Add some mock bookings if none exist
    if (this.bookings.length === 0) {
      this.bookings = this.getMockBookings();
      Storage.set('servicelink_bookings', this.bookings);
    }
  },
  
  getMockBookings() {
    return [
      {
        id: 'book_123456',
        type: 'service',
        item: {
          name: 'John Smith',
          skill: 'Plumbing',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'
        },
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '10:00 AM',
        address: { street: '123 Main St', city: 'New York', zip: '10001' },
        price: 145,
        status: 'confirmed',
        createdAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 'book_789012',
        type: 'tool',
        item: {
          name: 'Cordless Drill Set',
          category: 'Power Tools',
          image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=200&h=200&fit=crop'
        },
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        time: '2:00 PM',
        address: { street: '456 Park Ave', city: 'Brooklyn', zip: '11201' },
        price: 75,
        status: 'pending',
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'book_345678',
        type: 'service',
        item: {
          name: 'Maria Garcia',
          skill: 'Electrical',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop'
        },
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        time: '3:00 PM',
        address: { street: '789 Broadway', city: 'Queens', zip: '11101' },
        price: 225,
        status: 'completed',
        createdAt: new Date(Date.now() - 604800000).toISOString()
      }
    ];
  },
  
  renderKPIs() {
    const total = this.bookings.length;
    const active = this.bookings.filter(b => ['pending', 'confirmed', 'in-progress'].includes(b.status)).length;
    const completed = this.bookings.filter(b => b.status === 'completed').length;
    const cancelled = this.bookings.filter(b => b.status === 'cancelled').length;
    
    const kpis = [
      { label: 'Total Bookings', value: total, icon: '📋', color: 'blue' },
      { label: 'Active Jobs', value: active, icon: '⚡', color: 'yellow' },
      { label: 'Completed', value: completed, icon: '✅', color: 'green' },
      { label: 'Cancelled', value: cancelled, icon: '❌', color: 'red' }
    ];
    
    const container = document.getElementById('kpi-cards');
    if (!container) return;
    
    container.innerHTML = kpis.map(kpi => `
      <div class="kpi-card ${kpi.color}">
        <div class="kpi-icon">${kpi.icon}</div>
        <div class="kpi-value">${kpi.value}</div>
        <div class="kpi-label">${kpi.label}</div>
      </div>
    `).join('');
  },
  
  renderBookings(filter = 'all') {
    const container = document.getElementById('bookings-list');
    if (!container) return;
    
    let bookings = this.bookings;
    
    if (filter !== 'all') {
      bookings = bookings.filter(b => b.status === filter);
    }
    
    // Sort by date (newest first)
    bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (bookings.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <h3 class="empty-state-title">No bookings found</h3>
          <p class="empty-state-text">You don't have any ${filter !== 'all' ? filter : ''} bookings yet.</p>
          <a href="workers.html" class="btn btn-primary">Book a Service</a>
        </div>
      `;
      return;
    }
    
    container.innerHTML = bookings.map(booking => this.renderBookingCard(booking)).join('');
    
    // Bind action buttons
    this.bindBookingActions();
  },
  
  renderBookingCard(booking) {
    const statusConfig = {
      pending: { label: 'Pending', class: 'badge-warning' },
      confirmed: { label: 'Confirmed', class: 'badge-info' },
      'in-progress': { label: 'In Progress', class: 'badge-info' },
      completed: { label: 'Completed', class: 'badge-success' },
      cancelled: { label: 'Cancelled', class: 'badge-error' }
    };
    
    const status = statusConfig[booking.status];
    const isService = booking.type === 'service';
    const image = isService ? booking.item.avatar : booking.item.image;
    const title = booking.item.name;
    const subtitle = isService ? booking.item.skill : booking.item.category;
    
    const canCancel = ['pending', 'confirmed'].includes(booking.status);
    const canTrack = ['confirmed', 'in-progress'].includes(booking.status);
    const canReview = booking.status === 'completed';
    
    return `
      <div class="booking-card" data-id="${booking.id}">
        <div class="booking-header">
          <div class="booking-info">
            <img src="${image}" alt="${title}" class="booking-image">
            <div>
              <h4>${title}</h4>
              <p>${subtitle}</p>
              <span class="badge ${status.class}">${status.label}</span>
            </div>
          </div>
          <div class="booking-price">
            ${formatCurrency(booking.price)}
          </div>
        </div>
        <div class="booking-details">
          <div class="detail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>${formatDate(booking.date)}</span>
          </div>
          <div class="detail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>${booking.time}</span>
          </div>
          <div class="detail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>${booking.address.city}</span>
          </div>
        </div>
        <div class="booking-actions">
          ${canTrack ? `
            <button class="btn btn-secondary btn-sm btn-track" data-id="${booking.id}">
              Track
            </button>
          ` : ''}
          ${canCancel ? `
            <button class="btn btn-outline btn-sm btn-cancel" data-id="${booking.id}">
              Cancel
            </button>
          ` : ''}
          ${canReview ? `
            <button class="btn btn-primary btn-sm btn-review" data-id="${booking.id}">
              Review
            </button>
          ` : ''}
          <button class="btn btn-outline btn-sm btn-view" data-id="${booking.id}">
            View Details
          </button>
        </div>
      </div>
    `;
  },
  
  bindEvents() {
    // Filter tabs
    document.querySelectorAll('.booking-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.booking-filter').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.renderBookings(e.target.dataset.filter);
      });
    });
  },
  
  bindBookingActions() {
    // Cancel booking
    document.querySelectorAll('.btn-cancel').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.cancelBooking(id);
      });
    });
    
    // Track booking
    document.querySelectorAll('.btn-track').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.trackBooking(id);
      });
    });
    
    // Review booking
    document.querySelectorAll('.btn-review').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.openReviewModal(id);
      });
    });
    
    // View details
    document.querySelectorAll('.btn-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.viewBookingDetails(id);
      });
    });
  },
  
  cancelBooking(id) {
    Modal.confirm('Are you sure you want to cancel this booking?', {
      title: 'Cancel Booking',
      confirmText: 'Yes, Cancel',
      cancelText: 'Keep Booking'
    }).then(confirmed => {
      if (confirmed) {
        const booking = this.bookings.find(b => b.id === id);
        if (booking) {
          booking.status = 'cancelled';
          Storage.set('servicelink_bookings', this.bookings);
          
          this.renderKPIs();
          this.renderBookings();
          Toast.success('Booking cancelled successfully');
        }
      }
    });
  },
  
  trackBooking(id) {
    const booking = this.bookings.find(b => b.id === id);
    if (!booking) return;
    
    // Simulate tracking info
    const steps = [
      { label: 'Booking Confirmed', time: '2 hours ago', completed: true },
      { label: 'Worker Assigned', time: '1 hour ago', completed: true },
      { label: 'En Route', time: '15 minutes ago', completed: true },
      { label: 'Arrived', time: 'Arriving soon', completed: false }
    ];
    
    const content = `
      <div class="tracking-timeline">
        ${steps.map((step, index) => `
          <div class="timeline-step ${step.completed ? 'completed' : ''}">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <span class="timeline-label">${step.label}</span>
              <span class="timeline-time">${step.time}</span>
            </div>
          </div>
        `).join('')}
      </div>
      <div class="tracking-map">
        <div class="map-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="1 6 1 22 8 18 16 22 21 18 21 2 16 6 8 2 1 6"/>
            <line x1="8" y1="2" x2="8" y2="18"/>
            <line x1="16" y1="6" x2="16" y2="22"/>
          </svg>
          <p>Live tracking map</p>
        </div>
      </div>
    `;
    
    Modal.open(content, { title: 'Track Your Booking', maxWidth: '400px' });
  },
  
  openReviewModal(id) {
    const booking = this.bookings.find(b => b.id === id);
    if (!booking) return;
    
    const content = `
      <div class="review-form">
        <div class="rating-input">
          <label>Rate your experience</label>
          <div class="star-rating">
            ${[1, 2, 3, 4, 5].map(i => `
              <button class="star-btn" data-rating="${i}">★</button>
            `).join('')}
          </div>
        </div>
        <div class="form-group">
          <label>Your Review</label>
          <textarea class="form-textarea" rows="4" placeholder="Share your experience..."></textarea>
        </div>
        <button class="btn btn-primary btn-full btn-submit-review">Submit Review</button>
      </div>
    `;
    
    const { overlay } = Modal.open(content, { title: `Review ${booking.item.name}`, maxWidth: '400px' });
    
    // Star rating
    let selectedRating = 0;
    overlay.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedRating = parseInt(btn.dataset.rating);
        overlay.querySelectorAll('.star-btn').forEach((b, i) => {
          b.classList.toggle('active', i < selectedRating);
        });
      });
    });
    
    // Submit
    overlay.querySelector('.btn-submit-review').addEventListener('click', () => {
      if (selectedRating === 0) {
        Toast.warning('Please select a rating');
        return;
      }
      
      Toast.success('Review submitted successfully!');
      overlay.querySelector('.modal-close').click();
    });
  },
  
  viewBookingDetails(id) {
    const booking = this.bookings.find(b => b.id === id);
    if (!booking) return;
    
    const isService = booking.type === 'service';
    
    const content = `
      <div class="booking-details-modal">
        <div class="detail-row">
          <span>Booking ID</span>
          <strong>${booking.id}</strong>
        </div>
        <div class="detail-row">
          <span>Type</span>
          <strong>${isService ? 'Service' : 'Tool Rental'}</strong>
        </div>
        <div class="detail-row">
          <span>Date</span>
          <strong>${formatDate(booking.date)}</strong>
        </div>
        <div class="detail-row">
          <span>Time</span>
          <strong>${booking.time}</strong>
        </div>
        <div class="detail-row">
          <span>Address</span>
          <strong>${booking.address.street}, ${booking.address.city}, ${booking.address.zip}</strong>
        </div>
        <div class="detail-row">
          <span>Total</span>
          <strong>${formatCurrency(booking.price)}</strong>
        </div>
        <div class="detail-row">
          <span>Status</span>
          <span class="badge ${booking.status === 'completed' ? 'badge-success' : booking.status === 'cancelled' ? 'badge-error' : 'badge-info'}">
            ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>
        ${booking.notes ? `
          <div class="detail-row">
            <span>Notes</span>
            <p>${booking.notes}</p>
          </div>
        ` : ''}
      </div>
    `;
    
    Modal.open(content, { title: 'Booking Details', maxWidth: '450px' });
  }
};

/**
 * Worker Dashboard - Manage Jobs
 */
const WorkerDashboard = {
  jobs: [],
  isAvailable: true,
  
  init() {
    // Check auth and role
    if (!Auth.requireRole('worker', 'index.html')) return;
    
    this.loadJobs();
    this.renderStats();
    this.renderJobs();
    this.bindEvents();
  },
  
  loadJobs() {
    // Mock jobs assigned to worker
    this.jobs = [
      {
        id: 'job_123',
        customer: {
          name: 'Alice Johnson',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
          phone: '+1 (555) 987-6543'
        },
        service: 'Pipe Repair',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        time: '10:00 AM',
        address: { street: '123 Main St', city: 'New York', zip: '10001' },
        price: 130,
        status: 'pending',
        notes: 'Kitchen sink leaking under the cabinet'
      },
      {
        id: 'job_124',
        customer: {
          name: 'Bob Williams',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
          phone: '+1 (555) 456-7890'
        },
        service: 'Bathroom Installation',
        date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        time: '2:00 PM',
        address: { street: '456 Park Ave', city: 'Brooklyn', zip: '11201' },
        price: 450,
        status: 'accepted',
        notes: 'Install new toilet and sink'
      },
      {
        id: 'job_125',
        customer: {
          name: 'Carol Martinez',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
          phone: '+1 (555) 234-5678'
        },
        service: 'Drain Cleaning',
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        time: '3:00 PM',
        address: { street: '789 Broadway', city: 'Queens', zip: '11101' },
        price: 85,
        status: 'completed',
        notes: 'Clogged shower drain'
      }
    ];
    
    this.isAvailable = Storage.get('worker_availability', true);
  },
  
  renderStats() {
    const pending = this.jobs.filter(j => j.status === 'pending').length;
    const active = this.jobs.filter(j => ['accepted', 'in-progress'].includes(j.status)).length;
    const completed = this.jobs.filter(j => j.status === 'completed').length;
    const earnings = this.jobs
      .filter(j => j.status === 'completed')
      .reduce((sum, j) => sum + j.price, 0);
    
    const stats = [
      { label: 'Pending Requests', value: pending, icon: '⏳', color: 'yellow' },
      { label: 'Active Jobs', value: active, icon: '🔧', color: 'blue' },
      { label: 'Completed', value: completed, icon: '✅', color: 'green' },
      { label: 'Earnings', value: formatCurrency(earnings), icon: '💰', color: 'coral' }
    ];
    
    const container = document.getElementById('worker-stats');
    if (!container) return;
    
    container.innerHTML = stats.map(stat => `
      <div class="stat-card ${stat.color}">
        <div class="stat-icon">${stat.icon}</div>
        <div class="stat-value">${stat.value}</div>
        <div class="stat-label">${stat.label}</div>
      </div>
    `).join('');
  },
  
  renderJobs(filter = 'all') {
    const container = document.getElementById('jobs-list');
    if (!container) return;
    
    let jobs = this.jobs;
    
    if (filter !== 'all') {
      jobs = jobs.filter(j => j.status === filter);
    }
    
    if (jobs.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔧</div>
          <h3 class="empty-state-title">No jobs found</h3>
          <p class="empty-state-text">You don't have any ${filter !== 'all' ? filter : ''} jobs right now.</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = jobs.map(job => this.renderJobCard(job)).join('');
    
    this.bindJobActions();
  },
  
  renderJobCard(job) {
    const statusConfig = {
      pending: { label: 'New Request', class: 'badge-warning' },
      accepted: { label: 'Accepted', class: 'badge-info' },
      'in-progress': { label: 'In Progress', class: 'badge-info' },
      completed: { label: 'Completed', class: 'badge-success' },
      rejected: { label: 'Declined', class: 'badge-error' }
    };
    
    const status = statusConfig[job.status];
    const isPending = job.status === 'pending';
    const isActive = ['accepted', 'in-progress'].includes(job.status);
    
    return `
      <div class="job-card" data-id="${job.id}">
        <div class="job-header">
          <div class="job-customer">
            <img src="${job.customer.avatar}" alt="${job.customer.name}" class="customer-avatar">
            <div>
              <h4>${job.customer.name}</h4>
              <p>${job.service}</p>
              <span class="badge ${status.class}">${status.label}</span>
            </div>
          </div>
          <div class="job-price">
            ${formatCurrency(job.price)}
          </div>
        </div>
        <div class="job-details">
          <div class="detail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span>${formatDate(job.date)}</span>
          </div>
          <div class="detail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            <span>${job.time}</span>
          </div>
          <div class="detail">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>${job.address.city}</span>
          </div>
        </div>
        ${job.notes ? `
          <div class="job-notes">
            <strong>Notes:</strong> ${job.notes}
          </div>
        ` : ''}
        <div class="job-actions">
          ${isPending ? `
            <button class="btn btn-primary btn-sm btn-accept" data-id="${job.id}">
              Accept
            </button>
            <button class="btn btn-outline btn-sm btn-reject" data-id="${job.id}">
              Decline
            </button>
          ` : ''}
          ${isActive ? `
            <button class="btn btn-secondary btn-sm btn-start" data-id="${job.id}">
              ${job.status === 'in-progress' ? 'Complete' : 'Start Job'}
            </button>
          ` : ''}
          <button class="btn btn-outline btn-sm btn-contact" data-phone="${job.customer.phone}">
            Contact
          </button>
        </div>
      </div>
    `;
  },
  
  bindEvents() {
    // Availability toggle
    const availabilityToggle = document.getElementById('availability-toggle');
    if (availabilityToggle) {
      availabilityToggle.checked = this.isAvailable;
      availabilityToggle.addEventListener('change', (e) => {
        this.isAvailable = e.target.checked;
        Storage.set('worker_availability', this.isAvailable);
        Toast.success(this.isAvailable ? 'You are now available for jobs' : 'You are now offline');
      });
    }
    
    // Job filters
    document.querySelectorAll('.job-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.job-filter').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.renderJobs(e.target.dataset.filter);
      });
    });
  },
  
  bindJobActions() {
    // Accept job
    document.querySelectorAll('.btn-accept').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.updateJobStatus(id, 'accepted');
      });
    });
    
    // Reject job
    document.querySelectorAll('.btn-reject').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        this.updateJobStatus(id, 'rejected');
      });
    });
    
    // Start/Complete job
    document.querySelectorAll('.btn-start').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const job = this.jobs.find(j => j.id === id);
        const newStatus = job.status === 'accepted' ? 'in-progress' : 'completed';
        this.updateJobStatus(id, newStatus);
      });
    });
    
    // Contact customer
    document.querySelectorAll('.btn-contact').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const phone = e.target.dataset.phone;
        window.location.href = `tel:${phone}`;
      });
    });
  },
  
  updateJobStatus(id, status) {
    const job = this.jobs.find(j => j.id === id);
    if (job) {
      job.status = status;
      this.renderStats();
      this.renderJobs();
      
      const messages = {
        accepted: 'Job accepted successfully!',
        rejected: 'Job declined',
        'in-progress': 'Job started!',
        completed: 'Job completed! Great work!'
      };
      
      Toast.success(messages[status]);
    }
  }
};

// Initialize dashboards on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('user-dashboard')) {
    UserDashboard.init();
  }
  
  if (document.getElementById('worker-dashboard')) {
    WorkerDashboard.init();
  }
});
