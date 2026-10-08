import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if unauthorized (except for login/register calls)
      const isAuthRoute = error.config.url.includes('/api/auth/login') || error.config.url.includes('/api/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  register: async (email, password, full_name) => {
    const response = await api.post('/api/auth/register', { email, password, full_name });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// Application Services
export const applicationService = {
  getAll: async (params = {}) => {
    const response = await api.get('/api/applications', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/api/applications/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/api/applications', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/api/applications/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/api/applications/${id}`);
    return response.data;
  },
};

// Analytics Service
export const analyticsService = {
  getSummary: async () => {
    const response = await api.get('/api/analytics');
    return response.data;
  },
};

export default api;
