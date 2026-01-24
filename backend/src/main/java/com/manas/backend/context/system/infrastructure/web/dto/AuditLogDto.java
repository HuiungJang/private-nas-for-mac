package com.manas.backend.context.system.infrastructure.web.dto;

import java.time.Instant;
import java.util.UUID;

public record AuditLogDto(
        Long id,
        UUID userId,
        String action,
        String targetResource,
        String traceId,
        String ipAddress,
        Instant timestamp,
        String status
) {

}
