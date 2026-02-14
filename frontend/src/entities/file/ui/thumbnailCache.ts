const CACHE_TTL_MS = 30_000;

type Entry = {
  promise: Promise<Blob>;
  createdAt: number;
};

const cache = new Map<string, Entry>();
let cacheHit = 0;
let cacheMiss = 0;

export const getCachedBlob = (key: string, fetcher: () => Promise<Blob>): Promise<Blob> => {
  const now = Date.now();
  const hit = cache.get(key);

  if (hit && now - hit.createdAt < CACHE_TTL_MS) {
    cacheHit += 1;
    return hit.promise;
  }

  cacheMiss += 1;

  const promise = fetcher().catch((error) => {
    cache.delete(key);
    throw error;
  });

  cache.set(key, {promise, createdAt: now});
  return promise;
};

export const clearThumbnailCache = () => {
  cache.clear();
  cacheHit = 0;
  cacheMiss = 0;
};

export const getThumbnailCacheStats = () => ({
  size: cache.size,
  hit: cacheHit,
  miss: cacheMiss,
  hitRatio: cacheHit + cacheMiss === 0 ? 0 : cacheHit / (cacheHit + cacheMiss),
});
