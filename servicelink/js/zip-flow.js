// Connector layer for the generated ZIP UI.
// Keeps the ZIP visuals intact and wires the user-side product flow.

(function () {
  const isPage = (name) => location.pathname.toLowerCase().endsWith(name.toLowerCase());
  const inPages = location.pathname.toLowerCase().includes('/pages/');
  const pagePrefix = inPages ? '' : 'pages/';
  const rootPrefix = inPages ? '../' : '';

  const workers = [
    { id: 'w1', name: 'Alex Morgan', category: 'Master Electrician', price: 85, status: 'confirmed' },
    { id: 'w2', name: 'Maria Chen', category: 'Expert Plumber', price: 75, status: 'confirmed' },
    { id: 'w3', name: 'Sam Wilson', category: 'Carpentry Specialist', price: 65, status: 'pending' },
    { id: 'w4', name: 'Priya Nair', category: 'Deep Cleaning Pro', price: 45, status: 'confirmed' }
  ];

  const tools = [
    { id: 't1', name: 'DeWalt XR Hammer Drill', category: 'Power Tools', price: 24, status: 'confirmed' },
    { id: 't2', name: 'Bosch Laser Level Kit', category: 'Precision Tools', price: 18, status: 'confirmed' },
    { id: 't3', name: 'Stanley FATMAX Tool Set', category: 'Hand Tools', price: 16, status: 'confirmed' },
    { id: 't4', name: 'Makita Circular Saw', category: 'Power Tools', price: 28, status: 'confirmed' }
  ];

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function load(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
      return fallback;
    }
  }

  function go(path) {
    document.body.classList.add('lg-page-leaving');
    setTimeout(() => {
      location.href = path;
    }, 160);
  }

  function normalizeText(node) {
    return (node.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  function decorateMotion() {
    const style = document.createElement('style');
    style.textContent = `
      body { transition: opacity .22s ease, transform .22s ease; }
      body.lg-page-leaving { opacity: .25; transform: translateY(8px) scale(.995); }
      .lg-toast { position: fixed; right: 20px; bottom: 20px; z-index: 9999; background: rgba(15,23,42,.92); color: white; padding: 14px 18px; border-radius: 18px; box-shadow: 0 18px 50px rgba(15,23,42,.25); font: 700 14px Inter, sans-serif; animation: lgToast .28s ease both; }
      @keyframes lgToast { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      .lg-clickable { cursor: pointer; }
    `;
    document.head.appendChild(style);
    requestAnimationFrame(() => {
      document.querySelectorAll('main section, main article, main aside, main > div').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(18px)';
        el.style.transition = 'opacity .55s ease, transform .55s ease';
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, index * 45);
      });
    });
  }

  function toast(message) {
    const el = document.createElement('div');
    el.className = 'lg-toast';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }

  function wireCommonNav() {
    document.querySelectorAll('a, button').forEach((node) => {
      const text = normalizeText(node);
      if (!text) return;
      node.classList.add('lg-clickable');

      if (text.includes('find a pro') || text.includes('book a pro')) {
        node.addEventListener('click', (event) => {
          event.preventDefault();
          go(`${pagePrefix}workers.html`);
        });
      } else if (text.includes('rent tools') || text.includes('tool catalog')) {
        node.addEventListener('click', (event) => {
          event.preventDefault();
          go(`${pagePrefix}tools.html`);
        });
      } else if (text.includes('my bookings') || text.includes('dashboard')) {
        node.addEventListener('click', (event) => {
          event.preventDefault();
          go(`${pagePrefix}dashboard.html`);
        });
      } else if (text.includes('get started') || text.includes('search')) {
        node.addEventListener('click', (event) => {
          const input = document.querySelector('input');
          event.preventDefault();
          const q = input?.value ? `?q=${encodeURIComponent(input.value)}` : '';
          go(`${pagePrefix}workers.html${q}`);
        });
      } else if (text === 'book now' || text === 'hire now') {
        node.addEventListener('click', (event) => {
          if (isPage('workers.html') || isPage('booking.html')) return;
          event.preventDefault();
          go(`${pagePrefix}worker-profile.html?id=w1`);
        });
      } else if (text === 'rent now') {
        node.addEventListener('click', (event) => {
          if (isPage('tools.html') || isPage('booking.html')) return;
          event.preventDefault();
          go(`${pagePrefix}tool-detail.html?id=t1`);
        });
      }
    });
  }

  function wireLanding() {
    if (!isPage('index.html') && location.pathname !== '/' && !location.pathname.endsWith('/Labourgrid/')) return;
    const heroButton = Array.from(document.querySelectorAll('button')).find((button) => normalizeText(button).includes('search'));
    heroButton?.addEventListener('click', (event) => {
      event.preventDefault();
      const input = document.querySelector('input');
      const q = input?.value ? `?q=${encodeURIComponent(input.value)}` : '';
      go(`pages/workers.html${q}`);
    });
  }

  function wireWorkers() {
    if (!isPage('workers.html')) return;
    const buttons = Array.from(document.querySelectorAll('button')).filter((button) => normalizeText(button).includes('book now'));
    buttons.forEach((button, index) => {
      const worker = workers[index] || workers[0];
      const card = button.closest('.group') || button.closest('[class*="rounded"]');
      card?.addEventListener('click', (event) => {
        if (event.target.closest('button')) return;
        save('labourgrid_selected_item', { type: 'service', item: worker });
        go(`worker-profile.html?id=${worker.id}`);
      });
      button.addEventListener('click', (event) => {
        event.preventDefault();
        save('labourgrid_selected_item', { type: 'service', item: worker });
        toast(`${worker.name} selected`);
        setTimeout(() => go(`booking.html?type=service&id=${worker.id}`), 350);
      });
    });
  }

  function wireTools() {
    if (!isPage('tools.html')) return;
    const buttons = Array.from(document.querySelectorAll('button')).filter((button) => normalizeText(button).includes('rent now'));
    buttons.forEach((button, index) => {
      const tool = tools[index] || tools[0];
      if (button.disabled || button.className.includes('cursor-not-allowed')) return;
      const card = button.closest('.group') || button.closest('[class*="rounded"]');
      card?.addEventListener('click', (event) => {
        if (event.target.closest('button')) return;
        save('labourgrid_selected_item', { type: 'tool', item: tool });
        go(`tool-detail.html?id=${tool.id}`);
      });
      button.addEventListener('click', (event) => {
        event.preventDefault();
        save('labourgrid_selected_item', { type: 'tool', item: tool });
        toast(`${tool.name} selected`);
        setTimeout(() => go(`booking.html?type=tool&id=${tool.id}`), 350);
      });
    });
  }

  function wireBooking() {
    if (!isPage('booking.html')) return;
    const selected = load('labourgrid_selected_item', { type: 'service', item: workers[0] });
    const title = document.querySelector('h1');
    if (title && selected.item?.name) {
      title.innerHTML = `Book <span class="text-primary">${selected.item.name}</span>`;
    }

    const nextButton = Array.from(document.querySelectorAll('button')).find((button) => normalizeText(button).includes('review') || normalizeText(button).includes('book'));
    nextButton?.addEventListener('click', (event) => {
      event.preventDefault();
      nextButton.disabled = true;
      nextButton.textContent = 'Confirming...';
      const bookings = load('labourgrid_bookings', []);
      bookings.unshift({
        id: `SL-${Date.now().toString(36).toUpperCase()}`,
        type: selected.type,
        itemName: selected.item?.name || 'Service Booking',
        category: selected.item?.category || 'Professional Service',
        price: selected.item?.price || 110,
        status: 'pending',
        date: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        time: '10:00 AM',
        createdAt: new Date().toISOString()
      });
      save('labourgrid_bookings', bookings);
      toast('Booking saved to dashboard');
      setTimeout(() => go('dashboard.html'), 700);
    });
  }

  function wireDashboard() {
    if (!isPage('dashboard.html')) return;
    const bookings = load('labourgrid_bookings', []);
    if (!bookings.length) return;
    const firstCard = document.querySelector('main');
    const booking = bookings[0];
    const banner = document.createElement('section');
    banner.className = 'mx-auto max-w-[1280px] px-4 pt-6';
    banner.innerHTML = `
      <div class="bg-white border border-blue-100 shadow-xl rounded-[2rem] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p class="text-xs font-black text-blue-700 uppercase tracking-widest">Latest local booking</p>
          <h2 class="font-headline text-2xl font-black text-slate-900 mt-1">${booking.itemName}</h2>
          <p class="text-slate-500 text-sm mt-1">${booking.category} · ${booking.date} · ${booking.time}</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="px-4 py-2 rounded-full bg-orange-100 text-orange-800 font-black text-sm capitalize">${booking.status}</span>
          <span class="text-blue-700 font-black">$${booking.price}</span>
        </div>
      </div>
    `;
    firstCard?.prepend(banner);
  }

  document.addEventListener('DOMContentLoaded', () => {
    decorateMotion();
    wireCommonNav();
    wireLanding();
    wireWorkers();
    wireTools();
    wireBooking();
    wireDashboard();
  });
})();
