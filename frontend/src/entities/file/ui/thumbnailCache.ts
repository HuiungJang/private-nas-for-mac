const CACHE_TTL_MS = 30_000;

type Entry = {
  promise: Promise<Blob>;
  createdAt: number;
};

const cache = new Map<string, Entry>();

export const getCachedBlob = (key: string, fetcher: () => Promise<Blob>): Promise<Blob> => {
  const now = Date.now();
  const hit = cache.get(key);

  if (hit && now - hit.createdAt < CACHE_TTL_MS) {
    return hit.promise;
  }

  const promise = fetcher().catch((error) => {
    cache.delete(key);
    throw error;
  });

  cache.set(key, {promise, createdAt: now});
  return promise;
};

export const clearThumbnailCache = () => {
  cache.clear();
};
