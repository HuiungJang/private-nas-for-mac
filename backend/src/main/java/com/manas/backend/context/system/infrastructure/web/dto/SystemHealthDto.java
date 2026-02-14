package com.manas.backend.context.system.infrastructure.web.dto;

public record SystemHealthDto(
        double cpuUsage,
        long memoryUsed,
        long memoryTotal,
        long storageUsed,
        long storageTotal,
        double previewCacheHit,
        double previewCacheMiss,
        double previewCacheHitRatio,
        double auditLogsQueryP95Ms
) {

}
