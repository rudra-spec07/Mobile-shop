import axios from 'axios';
import { STORAGE_KEYS } from '../utils/constants';

let rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
rawApiUrl = rawApiUrl.trim().replace(/\/$/, '');
if (!rawApiUrl.endsWith('/api/v1')) {
  rawApiUrl = `${rawApiUrl}/api/v1`;
}

const API_BASE_URL = rawApiUrl;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
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

// Response Interceptor: Extract standard API payload & handle status normalization
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status || 500;
    const responseData = error.response?.data;
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED';

    let safeMessage = responseData?.message || error.message || 'An unexpected error occurred';

    if (isNetworkError) {
      safeMessage = 'Unable to connect to MS-Centre server. Please check your network connection.';
    } else if (status === 401) {
      // Clear token & user state on 401 unauthorized
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      // Trigger session expired event if not an explicit login endpoint request
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('mobileadda:session-expired'));
      }
    } else if (status === 429) {
      safeMessage = responseData?.message || 'Too many requests. Please try again after a few minutes.';
    } else if (status === 503) {
      safeMessage = 'MS-Centre service is temporarily unavailable for maintenance. Please try again shortly.';
    }

    return Promise.reject({
      status: isNetworkError ? 503 : status,
      message: safeMessage,
      data: responseData,
      errorCode: responseData?.errorCode || (isNetworkError ? 'NETWORK_ERROR' : 'API_ERROR'),
      isNetworkError,
      isRateLimit: status === 429,
      isSessionExpired: status === 401,
      isAccessDenied: status === 403,
      isNotFound: status === 404,
    });
  }
);

export default apiClient;
