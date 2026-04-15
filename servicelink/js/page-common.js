// Shared UI chrome for ServiceLink user-side pages

const PageCommon = {
  isNestedPage() {
    return window.location.pathname.includes('/pages/') || window.location.pathname.includes('\\pages\\');
  },

  basePath() {
    return this.isNestedPage() ? '../' : '';
  },

  currentPage() {
    return window.location.pathname.split(/[\\/]/).pop() || 'index.html';
  },

  navItems() {
    const base = this.basePath();
    return [
      { label: 'Home', href: `${base}index.html`, match: ['index.html'] },
      { label: 'Services', href: `${base}pages/workers.html`, match: ['workers.html', 'worker-profile.html'] },
      { label: 'Tools', href: `${base}pages/tools.html`, match: ['tools.html', 'tool-detail.html'] },
      { label: 'Dashboard', href: `${base}pages/dashboard.html`, match: ['dashboard.html'] }
    ];
  },

  renderNavbar() {
    const mount = document.querySelector('[data-app-nav]');
    if (!mount) return;

    const base = this.basePath();
    const page = this.currentPage();
    const user = window.AppState?.currentUser();
    const profileHref = `${base}pages/profile.html`;
    const loginHref = `${base}pages/login.html`;

    mount.innerHTML = `
      <header class="app-navbar">
        <div class="container app-navbar__inner">
          <a class="brand-link" href="${base}index.html" aria-label="ServiceLink home">
            <span class="logo-shell">
              <img src="${base}assets/logo-cropped.jpeg" alt="ServiceLink" class="logo-img">
            </span>
          </a>
          <nav class="nav-links" id="primaryNav" aria-label="Primary navigation">
            ${this.navItems().map((item) => `
              <a class="nav-link ${item.match.includes(page) ? 'active' : ''}" href="${item.href}">${item.label}</a>
            `).join('')}
          </nav>
          <div class="nav-actions">
            ${user ? `
              <a class="btn btn-secondary btn-sm" href="${profileHref}">${user.name || 'Profile'}</a>
              <button class="btn btn-primary btn-sm" type="button" data-logout>Logout</button>
            ` : `
              <a class="btn btn-secondary btn-sm" href="${loginHref}">Login</a>
              <a class="btn btn-primary btn-sm" href="${base}pages/register.html">Register</a>
            `}
            <button class="btn btn-secondary btn-icon mobile-menu-btn" id="mobileMenuBtn" type="button" aria-label="Open menu">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </header>
    `;

    document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
      document.getElementById('primaryNav')?.classList.toggle('active');
    });

    document.querySelector('[data-logout]')?.addEventListener('click', () => {
      window.AppState?.logout();
      window.location.href = `${base}index.html`;
    });
  },

  initReveal() {
    const revealTargets = document.querySelectorAll('[data-reveal]');
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      revealTargets.forEach((target) => observer.observe(target));
    } else {
      revealTargets.forEach((target) => target.classList.add('is-visible'));
    }
  },

  initPageTransitions() {
    const transition = document.getElementById('pageTransition');
    document.querySelectorAll('a[href]').forEach((link) => {
      link.addEventListener('click', (event) => {
        const href = link.getAttribute('href');
        const isLocalPage = href && !href.startsWith('#') && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('tel:');
        if (!isLocalPage || !transition || link.target) return;

        event.preventDefault();
        transition.classList.add('active');
        setTimeout(() => {
          window.location.href = href;
        }, 180);
      });
    });
  },

  initUserText() {
    document.querySelectorAll('[data-current-user]').forEach((node) => {
      const user = window.AppState?.currentUser();
      node.textContent = user?.name || 'Guest';
    });
  },

  init() {
    this.renderNavbar();
    this.initReveal();
    this.initPageTransitions();
    this.initUserText();
  }
};

document.addEventListener('DOMContentLoaded', () => PageCommon.init());
