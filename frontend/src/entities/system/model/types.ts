export interface SystemHealth {
  cpuUsage: number;
  memoryUsed: number;
  memoryTotal: number;
  storageUsed: number;
  storageTotal: number;
  previewCacheHit: number;
  previewCacheMiss: number;
  previewCacheHitRatio: number;
  auditLogsQueryP95Ms: number;
}
