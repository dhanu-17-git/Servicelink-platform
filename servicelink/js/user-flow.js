// Labourgrid user-side page controllers

const Flow = {
  params: new URLSearchParams(window.location.search),

  init() {
    this.bindRoutePage();
  },

  bindRoutePage() {
    if (document.getElementById('workers-grid')) this.initWorkers();
    if (document.getElementById('tools-grid')) this.initTools();
    if (document.getElementById('search-results')) this.initSearch();
    if (document.getElementById('profile-detail')) this.initWorkerProfile();
    if (document.getElementById('tool-detail')) this.initToolDetail();
    if (document.getElementById('booking-wizard')) this.initBooking();
    if (document.getElementById('user-dashboard')) this.initDashboard();
  },

  stars(rating) {
    return `<span class="font-bold">${rating.toFixed(1)}</span><span aria-hidden="true">★</span>`;
  },

  protectedAction(type, item) {
    AppState.selectItem(type, item);

    if (!AppState.isLoggedIn()) {
      const bookingUrl = `booking.html?type=${type}&id=${item.id}`;
      const loginUrl = `login.html?redirect=${encodeURIComponent(bookingUrl)}`;
      const registerUrl = `register.html?redirect=${encodeURIComponent(bookingUrl)}`;

      if (window.Modal) {
        Modal.open(`
          <div class="stack">
            <p style="color: var(--text-secondary)">Create an account or log in to continue. You can browse services, workers, and tools freely, but booking is protected.</p>
            <div class="inline-actions">
              <a class="btn btn-primary" href="${loginUrl}">Login</a>
              <a class="btn btn-secondary" href="${registerUrl}">Register</a>
            </div>
          </div>
        `, { title: 'Login required' });
      } else {
        window.location.href = loginUrl;
      }

      return false;
    }

    if (!AppState.isProfileComplete()) {
      if (window.Toast) Toast.warning('Please complete your profile before booking');
      window.location.href = `profile.html?redirect=${encodeURIComponent(`booking.html?type=${type}&id=${item.id}`)}`;
      return false;
    }

    window.location.href = `booking.html?type=${type}&id=${item.id}`;
    return true;
  },

  statusBadge(status) {
    const map = {
      pending: 'badge-warning',
      confirmed: 'badge-info',
      completed: 'badge-success',
      cancelled: 'badge-danger'
    };
    return `<span class="badge ${map[status] || 'badge-info'} status-badge">${status}</span>`;
  },

  applyFilters(type) {
    const q = (document.getElementById(`${type}-search`)?.value || this.params.get('q') || '').toLowerCase();
    const location = (document.getElementById(`${type}-location`)?.value || '').toLowerCase();
    const rating = Number(document.getElementById(`${type}-rating`)?.value || 0);
    const price = Number(document.getElementById(`${type}-price`)?.value || 10000);
    const cat = (this.params.get('cat') || '').toLowerCase();
    const data = type === 'workers' ? AppState.workers : AppState.tools;

    return data.filter((item) => {
      const nameText = type === 'workers'
        ? `${item.name} ${item.skill} ${item.bio} ${item.skills.join(' ')}`.toLowerCase()
        : `${item.name} ${item.category} ${item.description} ${item.features.join(' ')}`.toLowerCase();
      const itemPrice = item.hourlyRate || item.pricePerDay;
      const locationOk = type === 'tools' || !location || item.location.toLowerCase().includes(location);
      const catOk = !cat || nameText.includes(cat);
      return (!q || nameText.includes(q)) && locationOk && item.rating >= rating && itemPrice <= price && catOk;
    });
  },

  initWorkers() {
    const input = document.getElementById('workers-search');
    if (input && this.params.get('q')) input.value = this.params.get('q');
    document.querySelectorAll('[data-worker-filter]').forEach((control) => {
      control.addEventListener('input', () => this.renderWorkers());
      control.addEventListener('change', () => this.renderWorkers());
    });
    document.getElementById('clear-worker-filters')?.addEventListener('click', () => {
      document.querySelectorAll('[data-worker-filter]').forEach((control) => {
        control.value = control.dataset.default || '';
      });
      this.renderWorkers();
    });
    this.renderWorkers();
  },

  renderWorkers() {
    const grid = document.getElementById('workers-grid');
    const count = document.getElementById('workers-count');
    const workers = this.applyFilters('workers');
    if (count) count.textContent = `${workers.length} available professional${workers.length === 1 ? '' : 's'}`;
    grid.innerHTML = workers.length ? workers.map((worker) => `
      <article class="app-card interactive-card editorial-card p-5" data-reveal>
        <div class="editorial-card__media">
          <img src="${worker.avatar}" alt="${worker.name}">
          <span class="floating-chip">${worker.availability === 'available' ? 'Available today' : 'Busy today'}</span>
        </div>
        <div class="flex items-start justify-between gap-4 mb-3">
          <div class="min-w-0 flex-1">
            <p class="text-accent-orange font-semibold mb-1">${worker.skill}</p>
            <h3 class="font-display font-bold text-2xl truncate">${worker.name}</h3>
          </div>
          <div class="app-card p-4" style="min-width:88px; text-align:right;">
            <strong style="display:block; font-size:1.4rem;">${worker.rating.toFixed(1)}</strong>
            <span class="page-lede" style="font-size:.8rem;">${worker.reviews} reviews</span>
          </div>
        </div>
        <p class="text-gray-400 text-sm mb-4">${worker.bio}</p>
        <div class="result-meta mb-5">
          <span>${worker.location}</span>
          <span>${worker.experience}</span>
          <span>${AppState.formatCurrency(worker.hourlyRate)}/hr</span>
          <span>${worker.completedJobs} jobs</span>
        </div>
        <div class="flex flex-wrap gap-2 mb-5">
          ${worker.skills.slice(0, 3).map((skill) => `<span class="skill-pill">${skill}</span>`).join('')}
        </div>
        <div class="card-actions">
          <a class="btn btn-secondary btn-sm flex-1" href="worker-profile.html?id=${worker.id}">View Profile</a>
          <button class="btn btn-primary btn-sm flex-1" data-hire-worker="${worker.id}">Hire</button>
        </div>
      </article>
    `).join('') : this.emptyState('No workers found', 'Try another service, location, price, or rating filter.');
    this.afterRender();
  },

  initTools() {
    const input = document.getElementById('tools-search');
    if (input && this.params.get('q')) input.value = this.params.get('q');
    document.querySelectorAll('[data-tool-filter]').forEach((control) => {
      control.addEventListener('input', () => this.renderTools());
      control.addEventListener('change', () => this.renderTools());
    });
    document.getElementById('clear-tool-filters')?.addEventListener('click', () => {
      document.querySelectorAll('[data-tool-filter]').forEach((control) => {
        control.value = control.dataset.default || '';
      });
      this.renderTools();
    });
    this.renderTools();
  },

  renderTools() {
    const grid = document.getElementById('tools-grid');
    const count = document.getElementById('tools-count');
    const tools = this.applyFilters('tools');
    if (count) count.textContent = `${tools.length} rental tool${tools.length === 1 ? '' : 's'}`;
    grid.innerHTML = tools.length ? tools.map((tool) => `
      <article class="app-card interactive-card editorial-card p-5" data-reveal>
        <a href="tool-detail.html?id=${tool.id}" class="block editorial-card__media">
          <img src="${tool.image}" alt="${tool.name}">
          <span class="floating-chip">${tool.availability === 'available' ? 'Ready to rent' : 'Limited stock'}</span>
        </a>
        <div class="p-5">
          <div class="flex items-center justify-between gap-3 mb-3">
            <span class="badge badge-info">${tool.category}</span>
            <span class="badge ${tool.availability === 'available' ? 'badge-success' : 'badge-warning'}">${tool.availability === 'available' ? 'In Stock' : 'Limited'}</span>
          </div>
          <h3 class="font-display font-bold text-2xl mb-2">${tool.name}</h3>
          <div class="result-meta mb-3">${this.stars(tool.rating)} <span>${tool.reviews} reviews</span> <span>${tool.stock} in stock</span></div>
          <p class="text-gray-400 text-sm mb-4">${tool.description}</p>
          <div class="flex items-end justify-between gap-4 mb-5">
            <div><div class="text-2xl font-bold text-accent-blue">${AppState.formatCurrency(tool.pricePerDay)}</div><div class="text-xs text-gray-500">per day</div></div>
            <div class="text-right text-sm text-gray-400">${AppState.formatCurrency(tool.pricePerWeek)}/week</div>
          </div>
          <div class="card-actions">
            <a class="btn btn-secondary btn-sm flex-1" href="tool-detail.html?id=${tool.id}">View Details</a>
            <button class="btn btn-primary btn-sm flex-1" data-rent-tool="${tool.id}">Rent</button>
          </div>
        </div>
      </article>
    `).join('') : this.emptyState('No tools found', 'Try another query, category, price, or availability filter.');
    this.afterRender();
  },

  initSearch() {
    const input = document.getElementById('global-search');
    const type = document.getElementById('search-type');
    if (input) input.value = this.params.get('q') || '';
    [input, type, document.getElementById('search-location'), document.getElementById('search-rating'), document.getElementById('search-price')].forEach((control) => {
      control?.addEventListener('input', () => this.renderSearch());
      control?.addEventListener('change', () => this.renderSearch());
    });
    this.renderSearch();
  },

  renderSearch() {
    const q = (document.getElementById('global-search')?.value || '').toLowerCase();
    const type = document.getElementById('search-type')?.value || 'all';
    const location = (document.getElementById('search-location')?.value || '').toLowerCase();
    const rating = Number(document.getElementById('search-rating')?.value || 0);
    const price = Number(document.getElementById('search-price')?.value || 10000);
    const results = AppState.allItems().filter((item) => {
      const text = `${item.name} ${item.skill || ''} ${item.category || ''} ${item.bio || ''} ${item.description || ''}`.toLowerCase();
      const itemPrice = item.hourlyRate || item.pricePerDay;
      const locationOk = item.type === 'tool' || !location || item.location.toLowerCase().includes(location);
      return (type === 'all' || item.type === type) && (!q || text.includes(q)) && locationOk && item.rating >= rating && itemPrice <= price;
    });
    const container = document.getElementById('search-results');
    document.getElementById('search-count').textContent = `${results.length} result${results.length === 1 ? '' : 's'}`;
    container.innerHTML = results.length ? results.map((item) => {
      const isTool = item.type === 'tool';
      const href = isTool ? `tool-detail.html?id=${item.id}` : `worker-profile.html?id=${item.id}`;
      return `
        <article class="app-card interactive-card p-5" data-reveal>
          <div class="flex flex-col sm:flex-row gap-5">
            <img src="${isTool ? item.image : item.avatar}" alt="${item.name}" class="w-full sm:w-36 h-36 rounded-2xl object-cover border border-white/10">
            <div class="flex-1 min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-2">
                <span class="badge ${isTool ? 'badge-info' : 'badge-orange'}">${isTool ? 'Tool rental' : 'Service'}</span>
                <span class="badge ${item.availability === 'available' ? 'badge-success' : 'badge-warning'}">${item.availability === 'available' ? 'Available' : 'Limited/Busy'}</span>
              </div>
              <h3 class="font-display text-2xl font-bold mb-1">${item.name}</h3>
              <p class="text-accent-orange font-semibold mb-2">${isTool ? item.category : item.skill}</p>
              <div class="result-meta mb-3">${this.stars(item.rating)} <span>${item.reviews} reviews</span> ${!isTool ? `<span>${item.location}</span>` : `<span>${item.stock} in stock</span>`}</div>
              <p class="text-gray-400 text-sm mb-4">${isTool ? item.description : item.bio}</p>
              <div class="flex flex-wrap items-center gap-3">
                <a href="${href}" class="btn btn-secondary btn-sm">View Details</a>
                <button class="btn btn-primary btn-sm" ${isTool ? `data-rent-tool="${item.id}"` : `data-hire-worker="${item.id}"`}>${isTool ? 'Rent' : 'Hire'}</button>
                <span class="font-bold ${isTool ? 'text-accent-blue' : 'text-accent-orange'}">${AppState.formatCurrency(item.hourlyRate || item.pricePerDay)}${isTool ? '/day' : '/hr'}</span>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('') : this.emptyState('No matching services or tools', 'Try a broader search such as plumber, drill, cleaning, or electrical.');
    this.afterRender();
  },

  initWorkerProfile() {
    const worker = AppState.findWorker(this.params.get('id')) || AppState.workers[0];
    const container = document.getElementById('profile-detail');
    container.innerHTML = `
      <div class="detail-hero">
        <img src="${worker.avatar}" alt="${worker.name}" class="detail-image">
        <div>
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="badge badge-orange">${worker.skill}</span>
            <span class="badge ${worker.availability === 'available' ? 'badge-success' : 'badge-warning'}">${worker.availability === 'available' ? 'Available today' : 'Busy today'}</span>
          </div>
          <h1 class="page-title mb-4">${worker.name}</h1>
          <p class="page-lede mb-5">${worker.bio}</p>
          <div class="grid sm:grid-cols-4 gap-3 mb-6">
            ${this.stat('Rating', `${worker.rating} ★`)}
            ${this.stat('Reviews', worker.reviews)}
            ${this.stat('Jobs Done', worker.completedJobs)}
            ${this.stat('Experience', worker.experience)}
          </div>
          <div class="flex flex-wrap gap-2 mb-8">${worker.skills.map((skill) => `<span class="skill-pill">${skill}</span>`).join('')}</div>
          <div class="app-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p class="text-gray-400 text-sm">Starting price</p>
              <p class="text-3xl font-bold text-accent-orange">${AppState.formatCurrency(worker.hourlyRate)}<span class="text-base text-gray-400">/hr</span></p>
              <p class="text-sm text-gray-500 mt-1">${worker.location}</p>
            </div>
            <button class="btn btn-primary btn-lg" data-hire-worker="${worker.id}">Hire</button>
          </div>
        </div>
      </div>
    `;
    this.afterRender();
  },

  initToolDetail() {
    const tool = AppState.findTool(this.params.get('id')) || AppState.tools[0];
    const container = document.getElementById('tool-detail');
    container.innerHTML = `
      <div class="detail-hero">
        <img src="${tool.image}" alt="${tool.name}" class="detail-image">
        <div>
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="badge badge-info">${tool.category}</span>
            <span class="badge ${tool.availability === 'available' ? 'badge-success' : 'badge-warning'}">${tool.availability === 'available' ? 'Available now' : 'Limited stock'}</span>
          </div>
          <h1 class="page-title mb-4">${tool.name}</h1>
          <p class="page-lede mb-5">${tool.description}</p>
          <div class="grid sm:grid-cols-4 gap-3 mb-6">
            ${this.stat('Rating', `${tool.rating} ★`)}
            ${this.stat('Reviews', tool.reviews)}
            ${this.stat('Stock', tool.stock)}
            ${this.stat('Weekly', AppState.formatCurrency(tool.pricePerWeek))}
          </div>
          <div class="flex flex-wrap gap-2 mb-8">${tool.features.map((feature) => `<span class="skill-pill">${feature}</span>`).join('')}</div>
          <div class="app-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p class="text-gray-400 text-sm">Rental price</p>
              <p class="text-3xl font-bold text-accent-blue">${AppState.formatCurrency(tool.pricePerDay)}<span class="text-base text-gray-400">/day</span></p>
              <p class="text-sm text-gray-500 mt-1">Damage protection available at checkout</p>
            </div>
            <button class="btn btn-primary btn-lg" data-rent-tool="${tool.id}">Rent</button>
          </div>
        </div>
      </div>
    `;
    this.afterRender();
  },

  stat(label, value) {
    return `<div class="app-card p-4"><p class="text-gray-500 text-xs font-bold uppercase">${label}</p><p class="text-xl font-bold mt-1">${value}</p></div>`;
  },

  initBooking() {
    if (!AppState.isLoggedIn()) {
      window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
      return;
    }

    if (!AppState.isProfileComplete()) {
      if (window.Toast) Toast.warning('Please complete your profile before booking');
      window.location.href = `profile.html?redirect=${encodeURIComponent(window.location.href)}`;
      return;
    }

    this.booking = { step: 1, data: {} };
    const type = this.params.get('type') || AppState.selectedItem()?.type || 'service';
    const id = this.params.get('id');
    const item = AppState.findItem(type, id) || AppState.selectedItem()?.item || (type === 'tool' ? AppState.tools[0] : AppState.workers[0]);
    this.booking.type = type;
    this.booking.item = item;
    AppState.selectItem(type, item);

    const dateInput = document.getElementById('booking-date');
    if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

    const profile = AppState.profile();
    ['address', 'city', 'pincode'].forEach((field) => {
      const input = document.querySelector(`[name="${field}"]`);
      if (input && !input.value) input.value = profile[field] || '';
    });

    document.querySelectorAll('[data-booking-input]').forEach((input) => {
      input.addEventListener('input', () => this.updateBooking());
      input.addEventListener('change', () => this.updateBooking());
    });
    document.getElementById('booking-next')?.addEventListener('click', () => this.nextBookingStep());
    document.getElementById('booking-prev')?.addEventListener('click', () => this.prevBookingStep());
    document.getElementById('booking-confirm')?.addEventListener('click', () => this.confirmBooking());
    this.renderBookingShell();
    this.updateBooking();
  },

  renderBookingShell() {
    const item = this.booking.item;
    const isTool = this.booking.type === 'tool';
    document.getElementById('booking-selected').innerHTML = `
      <div class="flex gap-4">
        <img src="${isTool ? item.image : item.avatar}" alt="${item.name}" class="w-20 h-20 rounded-2xl object-cover border border-white/10">
        <div>
          <span class="badge ${isTool ? 'badge-info' : 'badge-orange'} mb-2">${isTool ? 'Tool rental' : 'Service booking'}</span>
          <h3 class="font-display font-bold text-xl">${item.name}</h3>
          <p class="text-gray-400">${isTool ? item.category : item.skill}</p>
        </div>
      </div>
    `;
  },

  updateBooking() {
    document.querySelectorAll('[data-booking-input]').forEach((input) => {
      this.booking.data[input.name] = input.value;
    });
    const item = this.booking.item;
    const isTool = this.booking.type === 'tool';
    const units = Math.max(1, Number(this.booking.data.duration || 1));
    const base = isTool ? item.pricePerDay * units : item.hourlyRate * units;
    const fee = Math.round(base * (isTool ? 0.15 : 0.1));
    this.booking.price = base + fee;
    document.getElementById('booking-price').innerHTML = `
      <div class="price-row"><span>${units} ${isTool ? 'day' : 'hour'}${units === 1 ? '' : 's'} x ${AppState.formatCurrency(isTool ? item.pricePerDay : item.hourlyRate)}</span><span>${AppState.formatCurrency(base)}</span></div>
      <div class="price-row"><span>${isTool ? 'Damage protection' : 'Service fee'}</span><span>${AppState.formatCurrency(fee)}</span></div>
      <div class="price-row total"><span>Total</span><span>${AppState.formatCurrency(this.booking.price)}</span></div>
    `;
    this.renderBookingSummary();
    this.updateBookingControls();
  },

  renderBookingSummary() {
    const data = this.booking.data;
    const summaryHtml = `
      <div class="summary-row"><span>Date</span><strong>${data.date ? AppState.formatDate(data.date) : 'Select date'}</strong></div>
      <div class="summary-row"><span>Time</span><strong>${data.time || 'Select time'}</strong></div>
      <div class="summary-row"><span>Location</span><strong>${data.city || 'Add city'}</strong></div>
      <div class="summary-row total"><span>Total</span><strong>${AppState.formatCurrency(this.booking.price || 0)}</strong></div>
    `;
    document.getElementById('booking-summary').innerHTML = summaryHtml;
    document.getElementById('booking-sidebar-summary').innerHTML = summaryHtml;
  },

  updateBookingControls() {
    document.querySelectorAll('.booking-step').forEach((step) => {
      step.classList.toggle('active', Number(step.dataset.step) === this.booking.step);
    });
    document.querySelectorAll('[data-step-chip]').forEach((chip) => {
      const number = Number(chip.dataset.stepChip);
      chip.classList.toggle('active', number === this.booking.step);
      chip.classList.toggle('done', number < this.booking.step);
    });
    document.getElementById('booking-prev').style.display = this.booking.step === 1 ? 'none' : 'inline-flex';
    document.getElementById('booking-next').style.display = this.booking.step === 5 ? 'none' : 'inline-flex';
    document.getElementById('booking-confirm').style.display = this.booking.step === 5 ? 'inline-flex' : 'none';
    document.getElementById('booking-next').disabled = !this.isBookingStepValid();
    document.getElementById('booking-confirm').disabled = !this.isBookingComplete();
  },

  isBookingStepValid() {
    const data = this.booking.data;
    if (this.booking.step === 2) return Boolean(data.date && data.time && data.duration);
    if (this.booking.step === 3) return Boolean(data.address && data.city && data.pincode);
    return true;
  },

  isBookingComplete() {
    return Boolean(this.booking.item && this.booking.data.date && this.booking.data.time && this.booking.data.duration && this.booking.data.address && this.booking.data.city && this.booking.data.pincode);
  },

  nextBookingStep() {
    if (!this.isBookingStepValid()) return;
    this.booking.step = Math.min(5, this.booking.step + 1);
    this.updateBookingControls();
  },

  prevBookingStep() {
    this.booking.step = Math.max(1, this.booking.step - 1);
    this.updateBookingControls();
  },

  confirmBooking() {
    if (!AppState.isLoggedIn() || !AppState.isProfileComplete()) {
      if (window.Toast) Toast.warning('Please complete your profile before booking');
      window.location.href = `profile.html?redirect=${encodeURIComponent(window.location.href)}`;
      return;
    }

    if (!this.isBookingComplete()) return;
    const btn = document.getElementById('booking-confirm');
    btn.disabled = true;
    btn.classList.add('loading-sheen');
    btn.textContent = 'Confirming...';
    setTimeout(() => {
      const item = this.booking.item;
      const isTool = this.booking.type === 'tool';
      AppState.saveBooking({
        id: `book_${Date.now().toString(36)}`,
        type: this.booking.type,
        itemId: item.id,
        itemName: item.name,
        image: isTool ? item.image : item.avatar,
        category: isTool ? item.category : item.skill,
        date: this.booking.data.date,
        time: this.booking.data.time,
        location: {
          address: this.booking.data.address,
          city: this.booking.data.city,
          pincode: this.booking.data.pincode
        },
        price: this.booking.price,
        status: 'pending',
        notes: this.booking.data.notes || '',
        createdAt: new Date().toISOString()
      });
      window.location.href = 'dashboard.html';
    }, 900);
  },

  initDashboard() {
    this.renderDashboard();
  },

  renderDashboard() {
    const bookings = AppState.bookings();
    const active = bookings.filter((booking) => ['pending', 'confirmed'].includes(booking.status));
    const past = bookings.filter((booking) => booking.status === 'completed');
    document.getElementById('dashboard-kpis').innerHTML = `
      ${this.stat('Active', active.length)}
      ${this.stat('Pending', bookings.filter((b) => b.status === 'pending').length)}
      ${this.stat('Confirmed', bookings.filter((b) => b.status === 'confirmed').length)}
      ${this.stat('Completed', past.length)}
    `;
    document.getElementById('active-bookings').innerHTML = active.length ? active.map((booking) => this.bookingCard(booking)).join('') : this.emptyState('No active bookings', 'Book a worker or rent a tool to see it here.');
    document.getElementById('past-bookings').innerHTML = past.length ? past.map((booking) => this.bookingCard(booking)).join('') : this.emptyState('No past bookings yet', 'Completed bookings will move into this section.');
  },

  bookingCard(booking) {
    return `
      <article class="app-card interactive-card p-5 booking-list-card" data-reveal>
        <img src="${booking.image}" alt="${booking.itemName}" class="booking-thumb">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-2">
            <h3 class="font-display font-bold text-xl truncate">${booking.itemName}</h3>
            ${this.statusBadge(booking.status)}
          </div>
          <p class="text-accent-orange font-semibold">${booking.category}</p>
          <div class="result-meta mt-2">
            <span>${AppState.formatDate(booking.date)}</span>
            <span>${booking.time}</span>
            <span>${booking.location.city}</span>
            <span class="font-bold text-white">${AppState.formatCurrency(booking.price)}</span>
          </div>
        </div>
      </article>
    `;
  },

  emptyState(title, text) {
    return `
      <div class="app-card p-8 text-center" style="grid-column:1/-1">
        <div class="mx-auto w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <h3 class="font-display font-bold text-xl mb-2">${title}</h3>
        <p class="text-gray-400">${text}</p>
      </div>
    `;
  },

  afterRender() {
    document.querySelectorAll('[data-hire-worker]').forEach((button) => {
      button.addEventListener('click', () => {
        const worker = AppState.findWorker(button.dataset.hireWorker);
        this.protectedAction('service', worker);
      });
    });
    document.querySelectorAll('[data-rent-tool]').forEach((button) => {
      button.addEventListener('click', () => {
        const tool = AppState.findTool(button.dataset.rentTool);
        this.protectedAction('tool', tool);
      });
    });
    requestAnimationFrame(() => {
      document.querySelectorAll('[data-reveal]').forEach((node, index) => {
        setTimeout(() => node.classList.add('is-visible'), index * 45);
      });
    });
  }
};

document.addEventListener('DOMContentLoaded', () => Flow.init());
