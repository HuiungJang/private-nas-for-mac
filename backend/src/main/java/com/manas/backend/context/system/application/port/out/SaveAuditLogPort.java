package com.manas.backend.context.system.application.port.out;

import com.manas.backend.context.system.domain.AuditLog;

public interface SaveAuditLogPort {

    void save(AuditLog auditLog);

}
