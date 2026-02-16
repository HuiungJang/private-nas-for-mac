const DEBUG_QUERY_KEY = 'debugUpload';
const DEBUG_STORAGE_KEY = 'NAS_DEBUG_UPLOAD';

const isTruthy = (value: string | null): boolean => value === '1' || value === 'true';

export const isUploadDebugEnabled = (): boolean => {
  if (!import.meta.env.DEV) return false;
  if (typeof window === 'undefined') return false;

  const queryValue = new URLSearchParams(window.location.search).get(DEBUG_QUERY_KEY);
  if (isTruthy(queryValue)) return true;

  return isTruthy(window.localStorage.getItem(DEBUG_STORAGE_KEY));
};

export const uploadDebugLog = (message: string, meta?: Record<string, unknown>) => {
  if (!isUploadDebugEnabled()) return;

  if (meta) {
    console.log(`[UploadDebug] ${message}`, meta);
    return;
  }

  console.log(`[UploadDebug] ${message}`);
};
