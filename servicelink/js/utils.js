// ServiceLink - Utility Functions

/**
 * Toast Notification System
 */
const Toast = {
  container: null,
  
  init() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },
  
  show(message, type = 'info', duration = 3000) {
    this.init();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
      success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
      error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
      warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };
    
    toast.innerHTML = `
      ${icons[type]}
      <span>${message}</span>
    `;
    
    this.container.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },
  
  success(message, duration) {
    this.show(message, 'success', duration);
  },
  
  error(message, duration) {
    this.show(message, 'error', duration);
  },
  
  warning(message, duration) {
    this.show(message, 'warning', duration);
  },
  
  info(message, duration) {
    this.show(message, 'info', duration);
  }
};

/**
 * Modal System
 */
const Modal = {
  open(content, options = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal" style="max-width: ${options.maxWidth || '500px'}">
        <div class="modal-header">
          <h3 class="modal-title">${options.title || ''}</h3>
          <button class="modal-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Close handlers
    const close = () => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    };
    
    overlay.querySelector('.modal-close').addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    
    // Trigger animation
    requestAnimationFrame(() => overlay.classList.add('active'));
    
    return { close, overlay };
  },
  
  confirm(message, options = {}) {
    return new Promise((resolve) => {
      const content = `
        <p style="margin-bottom: 1.5rem;">${message}</p>
        <div style="display: flex; gap: 1rem; justify-content: flex-end;">
          <button class="btn btn-outline" id="modal-cancel">${options.cancelText || 'Cancel'}</button>
          <button class="btn btn-primary" id="modal-confirm">${options.confirmText || 'Confirm'}</button>
        </div>
      `;
      
      const { close, overlay } = this.open(content, { title: options.title || 'Confirm' });
      
      overlay.querySelector('#modal-cancel').addEventListener('click', () => {
        close();
        resolve(false);
      });
      
      overlay.querySelector('#modal-confirm').addEventListener('click', () => {
        close();
        resolve(true);
      });
    });
  }
};

/**
 * Form Validation
 */
const Validator = {
  rules: {
    required: (value) => value.trim() !== '' || 'This field is required',
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || 'Please enter a valid email',
    phone: (value) => /^[\d\s\-+()]{10,}$/.test(value) || 'Please enter a valid phone number',
    minLength: (value, length) => value.length >= length || `Minimum ${length} characters required`,
    maxLength: (value, length) => value.length <= length || `Maximum ${length} characters allowed`,
    password: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value) || 
      'Password must be at least 8 characters with uppercase, lowercase, and number'
  },
  
  validate(field, rules) {
    const value = field.value;
    
    for (const rule of rules) {
      const [ruleName, param] = rule.split(':');
      const result = this.rules[ruleName](value, param);
      
      if (result !== true) {
        return result;
      }
    }
    
    return true;
  },
  
  validateForm(form, schema) {
    const errors = {};
    let isValid = true;
    
    // Clear previous errors
    form.querySelectorAll('.form-error').forEach(el => el.classList.remove('form-error'));
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    
    for (const [fieldName, rules] of Object.entries(schema)) {
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (!field) continue;
      
      const result = this.validate(field, rules);
      
      if (result !== true) {
        errors[fieldName] = result;
        isValid = false;
        
        field.classList.add('form-error');
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = result;
        field.parentNode.appendChild(errorEl);
      }
    }
    
    return { isValid, errors };
  }
};

/**
 * Local Storage Helper
 */
const Storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  
  remove(key) {
    localStorage.removeItem(key);
  },
  
  clear() {
    localStorage.clear();
  }
};

/**
 * Debounce Function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle Function
 */
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Format Currency
 */
function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

/**
 * Format Date
 */
function formatDate(date, options = {}) {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options
  });
}

/**
 * Generate ID
 */
function generateId(prefix = '') {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Scroll to Element
 */
function scrollToElement(selector, offset = 80) {
  const element = document.querySelector(selector);
  if (element) {
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

/**
 * Intersection Observer Helper
 */
function observeElements(selector, callback, options = {}) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
        if (options.once !== false) {
          observer.unobserve(entry.target);
        }
      }
    });
  }, {
    threshold: options.threshold || 0.1,
    rootMargin: options.rootMargin || '0px'
  });
  
  document.querySelectorAll(selector).forEach(el => observer.observe(el));
  
  return observer;
}

/**
 * Navbar Scroll Effect
 */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  
  window.addEventListener('scroll', throttle(() => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, 100));
}

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-btn');
  const menu = document.querySelector('.nav-links');
  
  if (!toggle || !menu) return;
  
  toggle.addEventListener('click', () => {
    menu.classList.toggle('active');
    const isOpen = menu.classList.contains('active');
    toggle.innerHTML = isOpen 
      ? '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
  });
}

/**
 * Initialize Common Features
 */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  
  // Reveal animations
  observeElements('.reveal', (el) => {
    el.classList.add('active');
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Toast, Modal, Validator, Storage, debounce, throttle, formatCurrency, formatDate, generateId };
}
