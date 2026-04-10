import axios from 'axios';

// Configure the base URL using an environment variable if available, otherwise fallback
const baseURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle unauthenticated responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 Unauthenticated
      localStorage.removeItem('token');
      // We might want to reload or redirect to login here,
      // but typically we handle that in the components or AuthContext
    }
    return Promise.reject(error);
  }
);

export default api;
