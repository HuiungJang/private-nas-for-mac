package com.manas.backend.context.system.infrastructure.web.dto;

public record SystemHealthDto(
        double cpuUsage,      // 0.0 to 1.0 (percentage)
        long memoryUsed,      // Bytes
        long memoryTotal,     // Bytes
        long storageUsed,     // Bytes
        long storageTotal     // Bytes
) {

}
