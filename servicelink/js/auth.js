// ServiceLink - Authentication Module

/**
 * Auth State Management
 */
const Auth = {
  currentUser: null,
  
  init() {
    // Check for existing session
    const session = Storage.get('servicelink_session');
    if (session) {
      this.currentUser = session;
      this.updateUI();
    }
    
    this.bindEvents();
  },
  
  bindEvents() {
    // Login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }
    
    // Register form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }
    
    // Role toggle
    const roleToggles = document.querySelectorAll('[name="role"]');
    roleToggles.forEach(toggle => {
      toggle.addEventListener('change', (e) => this.handleRoleChange(e));
    });
    
    // Password visibility toggle
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => this.togglePasswordVisibility(e));
    });
    
    // Password strength meter
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    passwordInputs.forEach(input => {
      if (input.dataset.strength === 'true') {
        input.addEventListener('input', (e) => this.checkPasswordStrength(e));
      }
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }
  },
  
  handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('[name="email"]').value;
    const password = form.querySelector('[name="password"]').value;
    const role = form.querySelector('[name="role"]:checked')?.value || 'user';
    
    // Validation
    const schema = {
      email: ['required', 'email'],
      password: ['required', 'minLength:6']
    };
    
    const { isValid } = Validator.validateForm(form, schema);
    if (!isValid) return;
    
    // Simulate API call
    this.setLoading(form, true);
    
    setTimeout(() => {
      // Mock authentication
      const mockUser = this.getMockUser(email, role);
      
      if (password.length >= 6) {
        this.setSession(mockUser);
        Toast.success('Login successful!');
        
        // Redirect based on role
        setTimeout(() => {
          if (role === 'worker') {
            window.location.href = 'worker-dashboard.html';
          } else {
            window.location.href = 'dashboard.html';
          }
        }, 500);
      } else {
        Toast.error('Invalid credentials');
      }
      
      this.setLoading(form, false);
    }, 1000);
  },
  
  handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const name = form.querySelector('[name="name"]').value;
    const email = form.querySelector('[name="email"]').value;
    const phone = form.querySelector('[name="phone"]')?.value;
    const password = form.querySelector('[name="password"]').value;
    const confirmPassword = form.querySelector('[name="confirm_password"]')?.value;
    const role = form.querySelector('[name="role"]:checked')?.value || 'user';
    
    // Validation
    const schema = {
      name: ['required', 'minLength:2'],
      email: ['required', 'email'],
      password: ['required', 'password'],
      confirm_password: ['required']
    };
    
    if (phone) schema.phone = ['phone'];
    
    const { isValid, errors } = Validator.validateForm(form, schema);
    
    if (!isValid) return;
    
    // Check password match
    if (password !== confirmPassword) {
      const confirmField = form.querySelector('[name="confirm_password"]');
      confirmField.classList.add('form-error');
      const errorEl = document.createElement('div');
      errorEl.className = 'error-message';
      errorEl.textContent = 'Passwords do not match';
      confirmField.parentNode.appendChild(errorEl);
      return;
    }
    
    // Simulate API call
    this.setLoading(form, true);
    
    setTimeout(() => {
      const mockUser = {
        id: generateId('user_'),
        name,
        email,
        phone,
        role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        createdAt: new Date().toISOString()
      };
      
      // Store registered users
      const users = Storage.get('servicelink_users', []);
      users.push(mockUser);
      Storage.set('servicelink_users', users);
      
      this.setSession(mockUser);
      Toast.success('Account created successfully!');
      
      setTimeout(() => {
        if (role === 'worker') {
          window.location.href = 'worker-dashboard.html';
        } else {
          window.location.href = 'dashboard.html';
        }
      }, 500);
      
      this.setLoading(form, false);
    }, 1500);
  },
  
  handleRoleChange(e) {
    const role = e.target.value;
    const workerFields = document.querySelectorAll('.worker-field');
    
    workerFields.forEach(field => {
      field.style.display = role === 'worker' ? 'block' : 'none';
    });
    
    // Update form title if exists
    const formTitle = document.getElementById('form-title');
    if (formTitle) {
      formTitle.textContent = role === 'worker' ? 'Join as a Professional' : 'Create Your Account';
    }
  },
  
  togglePasswordVisibility(e) {
    const button = e.currentTarget;
    const input = button.parentNode.querySelector('input');
    const icon = button.querySelector('svg');
    
    if (input.type === 'password') {
      input.type = 'text';
      icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
    } else {
      input.type = 'password';
      icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
    }
  },
  
  checkPasswordStrength(e) {
    const input = e.target;
    const password = input.value;
    const strengthBar = document.getElementById('password-strength-bar');
    
    if (!strengthBar) return;
    
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    strengthBar.className = 'password-strength-bar';
    
    if (password.length === 0) {
      strengthBar.style.width = '0';
    } else if (strength <= 1) {
      strengthBar.classList.add('weak');
    } else if (strength === 2 || strength === 3) {
      strengthBar.classList.add('medium');
    } else {
      strengthBar.classList.add('strong');
    }
  },
  
  setSession(user) {
    this.currentUser = user;
    Storage.set('servicelink_session', user);
    this.updateUI();
  },
  
  logout() {
    Modal.confirm('Are you sure you want to logout?', {
      title: 'Logout',
      confirmText: 'Logout',
      cancelText: 'Stay'
    }).then(confirmed => {
      if (confirmed) {
        this.currentUser = null;
        Storage.remove('servicelink_session');
        Toast.info('Logged out successfully');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 500);
      }
    });
  },
  
  updateUI() {
    // Update navigation based on auth state
    const authLinks = document.querySelectorAll('.auth-link');
    const guestLinks = document.querySelectorAll('.guest-link');
    
    if (this.currentUser) {
      authLinks.forEach(el => el.style.display = 'flex');
      guestLinks.forEach(el => el.style.display = 'none');
      
      // Update user name if displayed
      const userNameEls = document.querySelectorAll('.user-name');
      userNameEls.forEach(el => el.textContent = this.currentUser.name);
      
      // Update avatar if displayed
      const userAvatarEls = document.querySelectorAll('.user-avatar');
      userAvatarEls.forEach(el => el.src = this.currentUser.avatar);
    } else {
      authLinks.forEach(el => el.style.display = 'none');
      guestLinks.forEach(el => el.style.display = 'flex');
    }
  },
  
  getMockUser(email, role) {
    const names = email.split('@')[0].split('.');
    const name = names.map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
    
    return {
      id: generateId('user_'),
      name,
      email,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      joinedAt: new Date().toISOString()
    };
  },
  
  setLoading(form, loading) {
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = loading;
      submitBtn.innerHTML = loading 
        ? '<span class="spinner" style="width: 20px; height: 20px; border-width: 2px;"></span> Please wait...'
        : submitBtn.dataset.originalText || 'Submit';
    }
  },
  
  requireAuth(redirectUrl = 'login.html') {
    if (!this.currentUser) {
      Toast.warning('Please login to continue');
      setTimeout(() => {
        window.location.href = `${redirectUrl}?redirect=${encodeURIComponent(window.location.href)}`;
      }, 1000);
      return false;
    }
    return true;
  },
  
  requireRole(role, redirectUrl = 'index.html') {
    if (!this.requireAuth()) return false;
    
    if (this.currentUser.role !== role) {
      Toast.error('You do not have permission to access this page');
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 1000);
      return false;
    }
    return true;
  }
};

// Initialize auth on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});
