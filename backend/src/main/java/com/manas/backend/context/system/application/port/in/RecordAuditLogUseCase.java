package com.manas.backend.context.system.application.port.in;

import java.util.UUID;

public interface RecordAuditLogUseCase {

    void record(UUID userId, String action, String targetResource, String ipAddress, String status);

}
