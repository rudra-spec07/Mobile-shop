import axios from 'axios';
import { STORAGE_KEYS } from '../utils/constants';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT Bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract standard API payload & handle 401 unauthorized
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage =
      error.response?.data?.message || error.message || 'An unexpected network error occurred';
    
    if (error.response?.status === 401) {
      // Clear token on 401 unauthorized
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
    
    return Promise.reject({
      status: error.response?.status || 500,
      message: errorMessage,
      data: error.response?.data,
    });
  }
);

export default apiClient;
