import axios from 'axios';
import {v4 as uuidv4} from 'uuid';
import {useAuthStore} from '@/entities/user/model/store';
import {useNotificationStore} from '@/shared/model/useNotificationStore';

export const API_URL = '/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // For cookie-based auth if needed later, usually false for JWT header
});

// Request Interceptor: Add Trace ID and JWT Token
apiClient.interceptors.request.use(
    (config) => {
      // 1. Add Trace ID
      const traceId = uuidv4();
      config.headers['X-Trace-ID'] = traceId;

      // 2. Add JWT Token if exists
      // Access token from Zustand store (outside React component)
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

// Response Interceptor: Handle Errors globally
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      // Prefer server trace-id for end-to-end correlation; fallback to request trace-id.
      const responseTraceId = error.response?.headers?.['x-trace-id'];
      const requestTraceId = error.config?.headers?.['X-Trace-ID'];
      const traceId = responseTraceId || requestTraceId || 'unknown';
      console.error(`[API Error] TraceID: ${traceId}`, error.response?.data || error.message);

      const message = error.response?.data?.detail || error.response?.data?.message || error.message || 'An unexpected error occurred';
      useNotificationStore.getState().showNotification(message, 'error');

      return Promise.reject(error);
    }
);
