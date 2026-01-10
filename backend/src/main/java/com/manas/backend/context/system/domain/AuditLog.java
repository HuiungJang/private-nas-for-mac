package com.manas.backend.context.system.domain;

import java.time.Instant;
import java.util.UUID;

public record AuditLog(
        Long id,
        UUID userId,
        String action, // e.g., "LOGIN", "DELETE_FILE"
        String targetResource, // e.g., filename, username
        String traceId,
        String ipAddress,
        Instant timestamp,
        String status // "SUCCESS", "FAILURE"
) {

    public static AuditLog create(UUID userId, String action, String targetResource, String traceId,
            String ipAddress, String status) {
        return new AuditLog(null, userId, action, targetResource, traceId, ipAddress, Instant.now(), status);
    }

}
