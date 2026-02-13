package com.manas.backend.context.system.application.port.out;

import com.manas.backend.context.system.domain.AuditLog;
import java.util.List;

public interface LoadAuditLogsPort {

    List<AuditLog> loadPage(int offset, int limit);

}
