import axios from 'axios';
import {v4 as uuidv4} from 'uuid';
import {useAuthStore} from '@/entities/user/model/store';
import {useNotificationStore} from '@/shared/model/useNotificationStore';
import {uploadDebugLog} from '@/shared/debug/uploadDebug';

export const API_URL = '/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const shouldRetryRequest = (status?: number, method?: string) => {
  const normalizedMethod = (method ?? 'GET').toUpperCase();
  const idempotent = ['GET', 'HEAD', 'OPTIONS'].includes(normalizedMethod);

  if (!idempotent) return false;
  if (!status) return true;
  return status === 429 || status >= 500;
};

apiClient.interceptors.request.use(
  (config) => {
    const traceId = uuidv4();
    config.headers['X-Trace-ID'] = traceId;

    const token = useAuthStore.getState().token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const url = config.url ?? '';
    if (url.includes('/files/upload')) {
      uploadDebugLog('C) upload request started', {
        method: config.method,
        traceId,
        hasFormData: typeof FormData !== 'undefined' && config.data instanceof FormData,
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    const url = response.config?.url ?? '';
    if (url.includes('/files/upload')) {
      uploadDebugLog('C) upload request succeeded', {
        status: response.status,
        traceId: response.config?.headers?.['X-Trace-ID'],
      });
    }
    return response;
  },
  (error) => {
    const responseTraceId = error.response?.headers?.['x-trace-id'];
    const requestTraceId = error.config?.headers?.['X-Trace-ID'];
    const traceId = responseTraceId || requestTraceId || 'unknown';
    console.error(`[API Error] TraceID: ${traceId}`, error.response?.data || error.message);

    const url = error.config?.url ?? '';
    if (url.includes('/files/upload')) {
      uploadDebugLog('C) upload request failed', {
        status: error.response?.status,
        traceId,
        detail: error.response?.data?.detail,
        message: error.message,
      });
    }

    const status: number | undefined = error.response?.status;

    if (status === 401) {
      useAuthStore.getState().logout();
    }

    const message =
      status === 401
        ? '세션이 만료되었습니다. 다시 로그인해 주세요.'
        : status === 403
          ? '권한이 없습니다.'
          : status === 429
            ? '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.'
            : error.response?.data?.detail ||
              error.response?.data?.message ||
              error.message ||
              'An unexpected error occurred';

    const method = error.config?.method as string | undefined;
    const retryable = shouldRetryRequest(status, method);
    if (!retryable) {
      useNotificationStore.getState().showNotification(message, 'error');
    }

    return Promise.reject(error);
  }
);
