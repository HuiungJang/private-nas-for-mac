package com.manas.backend.context.system.application.port.in;

import com.manas.backend.context.system.domain.AuditLog;
import java.util.List;

public interface GetAuditLogsUseCase {

    List<AuditLog> getAuditLogs(int offset, int limit);

}
