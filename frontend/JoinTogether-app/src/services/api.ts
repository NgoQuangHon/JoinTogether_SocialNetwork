import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

const api = axios.create({
  baseURL: `${API_BASE_URL.replace(/\/$/, '')}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('auth_state');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default api;
