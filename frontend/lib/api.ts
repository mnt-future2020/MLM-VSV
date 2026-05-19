import axios from 'axios';

// Use empty string for relative URLs (Next.js will proxy to backend)
// This allows /api calls to be proxied to backend via next.config.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Create axios instance with default config
export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage (only on client-side)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Public endpoints that should not trigger auth redirects
const PUBLIC_ENDPOINTS = ['/api/settings/public', '/api/auth/', '/api/system/'];

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized (token expired) - only on client-side
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const requestUrl = error.config?.url || '';
      const isPublicEndpoint = PUBLIC_ENDPOINTS.some(ep => requestUrl.includes(ep));

      // Only redirect to login for protected endpoints
      if (!isPublicEndpoint) {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login') &&
            !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
