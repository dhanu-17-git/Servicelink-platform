// ── API Configuration ──
// Central config for the Django REST backend

export const API_BASE = 'http://localhost:8000/api';

// Helper: attach JWT token to requests
export const authHeaders = () => {
  const token = sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Helper: standard fetch with auth
export const apiFetch = async (endpoint, options = {}) => {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...options.headers,
    },
  });
  return res;
};
