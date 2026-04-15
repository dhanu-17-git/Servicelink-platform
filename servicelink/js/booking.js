// ServiceLink - Booking Module

/**
 * Booking System - Multi-step Form
 */
const Booking = {
  currentStep: 1,
  totalSteps: 4,
  bookingData: {},
  
  init() {
    // Check auth
    if (!Auth.requireAuth('login.html')) return;
    
    // Load selected item
    this.loadSelectedItem();
    
    // Initialize form
    this.bindEvents();
    this.updateStepDisplay();
    this.calculatePrice();
  },
  
  loadSelectedItem() {
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type') || 'service';
    
    this.bookingType = type;
    
    if (type === 'service') {
      this.selectedItem = Storage.get('selected_worker');
      if (!this.selectedItem) {
        Toast.warning('Please select a worker first');
        setTimeout(() => window.location.href = 'workers.html', 1000);
        return;
      }
    } else {
      this.selectedItem = Storage.get('selected_tool');
      if (!this.selectedItem) {
        Toast.warning('Please select a tool first');
        setTimeout(() => window.location.href = 'tools.html', 1000);
        return;
      }
    }
    
    this.renderSelectedItem();
  },
  
  renderSelectedItem() {
    const container = document.getElementById('selected-item');
    if (!container) return;
    
    if (this.bookingType === 'service') {
      container.innerHTML = `
        <div class="selected-item-card">
          <img src="${this.selectedItem.avatar}" alt="${this.selectedItem.name}" class="selected-item-image">
          <div class="selected-item-info">
            <h4>${this.selectedItem.name}</h4>
            <p>${this.selectedItem.skill}</p>
            <div class="rating">
              <span class="rating-star">★</span>
              <span>${this.selectedItem.rating} (${this.selectedItem.reviews} reviews)</span>
            </div>
            <p class="selected-item-price">$${this.selectedItem.hourlyRate}/hour</p>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="selected-item-card">
          <img src="${this.selectedItem.image}" alt="${this.selectedItem.name}" class="selected-item-image">
          <div class="selected-item-info">
            <h4>${this.selectedItem.name}</h4>
            <p>${this.selectedItem.category}</p>
            <div class="rating">
              <span class="rating-star">★</span>
              <span>${this.selectedItem.rating}</span>
            </div>
            <p class="selected-item-price">$${this.selectedItem.pricePerDay}/day</p>
          </div>
        </div>
      `;
    }
  },
  
  bindEvents() {
    // Step navigation
    document.getElementById('next-step')?.addEventListener('click', () => this.nextStep());
    document.getElementById('prev-step')?.addEventListener('click', () => this.prevStep());
    
    // Form inputs
    const inputs = document.querySelectorAll('[data-booking]');
    inputs.forEach(input => {
      input.addEventListener('change', (e) => this.handleInputChange(e));
      input.addEventListener('input', (e) => this.handleInputChange(e));
    });
    
    // Date/time inputs
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
      // Set min date to today
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
    }
    
    // Duration change for tools
    const durationInput = document.getElementById('rental-duration');
    if (durationInput) {
      durationInput.addEventListener('change', () => this.calculatePrice());
    }
    
    // Confirm booking
    document.getElementById('confirm-booking')?.addEventListener('click', () => this.confirmBooking());
    
    // Change selection
    document.getElementById('change-selection')?.addEventListener('click', () => {
      const redirectUrl = this.bookingType === 'service' ? 'workers.html' : 'tools.html';
      window.location.href = redirectUrl;
    });
  },
  
  handleInputChange(e) {
    const { booking } = e.target.dataset;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    
    this.bookingData[booking] = value;
    
    // Recalculate price if relevant fields change
    if (['hours', 'rental-duration'].includes(booking)) {
      this.calculatePrice();
    }
  },
  
  nextStep() {
    if (this.validateStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.updateStepDisplay();
        
        if (this.currentStep === this.totalSteps) {
          this.renderSummary();
        }
      }
    }
  },
  
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateStepDisplay();
    }
  },
  
  validateStep() {
    const step = this.currentStep;
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(el => el.classList.remove('form-error'));
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    switch (step) {
      case 1: // Service/Tool selection (pre-filled)
        if (!this.selectedItem) {
          Toast.error('Please select a service or tool');
          isValid = false;
        }
        break;
        
      case 2: // Date & Time
        const date = document.getElementById('booking-date')?.value;
        const time = document.getElementById('booking-time')?.value;
        
        if (!date) {
          this.showError('booking-date', 'Please select a date');
          isValid = false;
        }
        if (!time) {
          this.showError('booking-time', 'Please select a time');
          isValid = false;
        }
        break;
        
      case 3: // Address
        const address = document.getElementById('address')?.value;
        const city = document.getElementById('city')?.value;
        const zip = document.getElementById('zip')?.value;
        
        if (!address) {
          this.showError('address', 'Please enter your address');
          isValid = false;
        }
        if (!city) {
          this.showError('city', 'Please enter your city');
          isValid = false;
        }
        if (!zip) {
          this.showError('zip', 'Please enter your ZIP code');
          isValid = false;
        }
        break;
    }
    
    return isValid;
  },
  
  showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
      field.classList.add('form-error');
      const errorEl = document.createElement('div');
      errorEl.className = 'error-message';
      errorEl.textContent = message;
      field.parentNode.appendChild(errorEl);
    }
  },
  
  updateStepDisplay() {
    // Update step indicators
    document.querySelectorAll('.step').forEach((step, index) => {
      step.classList.remove('active', 'completed');
      if (index + 1 < this.currentStep) {
        step.classList.add('completed');
      } else if (index + 1 === this.currentStep) {
        step.classList.add('active');
      }
    });
    
    // Show/hide step content
    document.querySelectorAll('.step-content').forEach((content, index) => {
      content.style.display = index + 1 === this.currentStep ? 'block' : 'none';
    });
    
    // Update buttons
    const prevBtn = document.getElementById('prev-step');
    const nextBtn = document.getElementById('next-step');
    
    if (prevBtn) {
      prevBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-flex';
    }
    
    if (nextBtn) {
      nextBtn.textContent = this.currentStep === this.totalSteps ? 'Confirm' : 'Next';
      nextBtn.classList.toggle('btn-primary', this.currentStep !== this.totalSteps);
      nextBtn.classList.toggle('btn-secondary', this.currentStep === this.totalSteps);
    }
    
    // Show/hide confirm button on last step
    const confirmBtn = document.getElementById('confirm-booking');
    if (confirmBtn) {
      confirmBtn.style.display = this.currentStep === this.totalSteps ? 'inline-flex' : 'none';
    }
  },
  
  calculatePrice() {
    let basePrice = 0;
    let totalPrice = 0;
    let breakdown = [];
    
    if (this.bookingType === 'service') {
      const hours = parseInt(this.bookingData.hours) || 2;
      basePrice = this.selectedItem.hourlyRate * hours;
      
      breakdown.push({
        label: `${hours} hours × $${this.selectedItem.hourlyRate}/hr`,
        amount: basePrice
      });
      
      // Service fee
      const serviceFee = Math.round(basePrice * 0.10);
      breakdown.push({
        label: 'Service Fee (10%)',
        amount: serviceFee
      });
      
      totalPrice = basePrice + serviceFee;
    } else {
      const days = parseInt(this.bookingData['rental-duration']) || 1;
      
      // Apply weekly discount if 7+ days
      if (days >= 7) {
        const weeks = Math.floor(days / 7);
        const remainingDays = days % 7;
        basePrice = (weeks * this.selectedItem.pricePerWeek) + (remainingDays * this.selectedItem.pricePerDay);
        
        breakdown.push({
          label: `${weeks} week${weeks > 1 ? 's' : ''} × $${this.selectedItem.pricePerWeek}`,
          amount: weeks * this.selectedItem.pricePerWeek
        });
        
        if (remainingDays > 0) {
          breakdown.push({
            label: `${remainingDays} day${remainingDays > 1 ? 's' : ''} × $${this.selectedItem.pricePerDay}`,
            amount: remainingDays * this.selectedItem.pricePerDay
          });
        }
      } else {
        basePrice = days * this.selectedItem.pricePerDay;
        breakdown.push({
          label: `${days} day${days > 1 ? 's' : ''} × $${this.selectedItem.pricePerDay}/day`,
          amount: basePrice
        });
      }
      
      // Damage protection
      const protection = Math.round(basePrice * 0.15);
      breakdown.push({
        label: 'Damage Protection (15%)',
        amount: protection
      });
      
      totalPrice = basePrice + protection;
    }
    
    this.priceBreakdown = breakdown;
    this.totalPrice = totalPrice;
    
    // Update display
    const totalEl = document.getElementById('total-price');
    if (totalEl) {
      totalEl.textContent = formatCurrency(totalPrice);
    }
  },
  
  renderSummary() {
    const container = document.getElementById('booking-summary');
    if (!container) return;
    
    const date = document.getElementById('booking-date')?.value;
    const time = document.getElementById('booking-time')?.value;
    const address = document.getElementById('address')?.value;
    const city = document.getElementById('city')?.value;
    const zip = document.getElementById('zip')?.value;
    const notes = document.getElementById('notes')?.value;
    
    const fullAddress = `${address}, ${city}, ${zip}`;
    
    let breakdownHtml = this.priceBreakdown.map(item => `
      <div class="price-row">
        <span>${item.label}</span>
        <span>${formatCurrency(item.amount)}</span>
      </div>
    `).join('');
    
    container.innerHTML = `
      <div class="summary-section">
        <h4>${this.bookingType === 'service' ? 'Service' : 'Tool'} Details</h4>
        <div class="summary-item">
          <img src="${this.bookingType === 'service' ? this.selectedItem.avatar : this.selectedItem.image}" alt="">
          <div>
            <p class="summary-name">${this.selectedItem.name}</p>
            <p class="summary-meta">${this.bookingType === 'service' ? this.selectedItem.skill : this.selectedItem.category}</p>
          </div>
        </div>
      </div>
      
      <div class="summary-section">
        <h4>Date & Time</h4>
        <p>${formatDate(date)} at ${time}</p>
      </div>
      
      <div class="summary-section">
        <h4>Location</h4>
        <p>${fullAddress}</p>
      </div>
      
      ${notes ? `
        <div class="summary-section">
          <h4>Notes</h4>
          <p>${notes}</p>
        </div>
      ` : ''}
      
      <div class="summary-section price-breakdown">
        <h4>Price Breakdown</h4>
        ${breakdownHtml}
        <div class="price-row total">
          <span>Total</span>
          <span>${formatCurrency(this.totalPrice)}</span>
        </div>
      </div>
    `;
  },
  
  confirmBooking() {
    // Show loading state
    const confirmBtn = document.getElementById('confirm-booking');
    const originalText = confirmBtn.textContent;
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<span class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></span> Processing...';
    
    // Simulate API call
    setTimeout(() => {
      const booking = {
        id: generateId('book_'),
        type: this.bookingType,
        item: this.selectedItem,
        date: document.getElementById('booking-date').value,
        time: document.getElementById('booking-time').value,
        address: {
          street: document.getElementById('address').value,
          city: document.getElementById('city').value,
          zip: document.getElementById('zip').value
        },
        notes: document.getElementById('notes')?.value || '',
        price: this.totalPrice,
        status: 'pending',
        createdAt: new Date().toISOString(),
        userId: Auth.currentUser?.id
      };
      
      // Save to storage
      const bookings = Storage.get('servicelink_bookings', []);
      bookings.push(booking);
      Storage.set('servicelink_bookings', bookings);
      
      // Clear selected item
      Storage.remove(this.bookingType === 'service' ? 'selected_worker' : 'selected_tool');
      
      // Show success
      this.showSuccessState(booking);
      
    }, 2000);
  },
  
  showSuccessState(booking) {
    const container = document.querySelector('.booking-container');
    if (!container) return;
    
    container.innerHTML = `
      <div class="booking-success">
        <div class="success-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </div>
        <h2>Booking Confirmed!</h2>
        <p>Your ${this.bookingType} has been booked successfully.</p>
        <div class="booking-reference">
          <span>Booking ID</span>
          <strong>${booking.id}</strong>
        </div>
        <div class="success-actions">
          <a href="dashboard.html" class="btn btn-primary">View My Bookings</a>
          <a href="index.html" class="btn btn-outline">Back to Home</a>
        </div>
      </div>
    `;
    
    Toast.success('Booking confirmed successfully!');
  }
};

// Initialize booking on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('booking-form')) {
    Booking.init();
  }
});
