import axios from 'axios';
import {v4 as uuidv4} from 'uuid';

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
      // Note: In FSD, avoiding direct dependency on 'entities/user' here is good.
      // We can assume localStorage usage for Phase 1.
      const token = localStorage.getItem('token');
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
      // Log error with Trace ID if available
      const traceId = error.config?.headers['X-Trace-ID'];
      console.error(`[API Error] TraceID: ${traceId}`, error.response?.data || error.message);

      // TODO: Trigger Global Toast/Snackbar here
      return Promise.reject(error);
    }
);
