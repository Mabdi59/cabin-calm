import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 (Unauthorized) or 403 (Forbidden) - token expired/invalid
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Check if it's not a login/register request
      const isAuthEndpoint = error.config.url?.includes('/auth/login') || 
                             error.config.url?.includes('/auth/register');
      
      if (!isAuthEndpoint) {
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Store error message
        localStorage.setItem('sessionExpired', 'true');
        
        // Redirect to login
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const flightsAPI = {
  getAll: () => api.get('/flights'),
  getOne: (id) => api.get(`/flights/${id}`),
  create: (data) => api.post('/flights', data),
  update: (id, data) => api.put(`/flights/${id}`, data),
  delete: (id) => api.delete(`/flights/${id}`),
  getStats: () => api.get('/flights/stats/trends'),
};

export const educationAPI = {
  getAll: (category) => api.get('/education', { params: { category } }),
  getOne: (id) => api.get(`/education/${id}`),
};

export default api;
