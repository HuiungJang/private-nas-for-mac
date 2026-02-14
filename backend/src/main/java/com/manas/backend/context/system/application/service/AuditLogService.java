package com.manas.backend.context.system.application.service;

import com.manas.backend.common.tracing.TraceConstants;
import com.manas.backend.context.system.application.port.in.GetAuditLogsUseCase;
import com.manas.backend.context.system.application.port.in.RecordAuditLogUseCase;
import com.manas.backend.context.system.application.port.out.LoadAuditLogsPort;
import com.manas.backend.context.system.application.port.out.SaveAuditLogPort;
import com.manas.backend.context.system.domain.AuditLog;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import java.util.List;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class AuditLogService implements RecordAuditLogUseCase, GetAuditLogsUseCase {

    private final SaveAuditLogPort saveAuditLogPort;
    private final LoadAuditLogsPort loadAuditLogsPort;
    private final Timer auditQueryTimer;

    public AuditLogService(SaveAuditLogPort saveAuditLogPort,
            LoadAuditLogsPort loadAuditLogsPort,
            MeterRegistry meterRegistry) {
        this.saveAuditLogPort = saveAuditLogPort;
        this.loadAuditLogsPort = loadAuditLogsPort;
        this.auditQueryTimer = Timer.builder("app.audit.logs.query")
                .publishPercentiles(0.95)
                .register(meterRegistry);
    }

    @Async
    @Override
    public void record(UUID userId, String action, String targetResource, String ipAddress, String status) {
        String traceId = MDC.get(TraceConstants.TRACE_ID_MDC_KEY);

        AuditLog auditLog = AuditLog.create(
                userId,
                action,
                targetResource,
                traceId != null ? traceId : "UNKNOWN",
                ipAddress,
                status
        );

        try {
            saveAuditLogPort.save(auditLog);
            log.debug("Audit log recorded: {}", auditLog);
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", auditLog, e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogs(int offset, int limit) {
        int normalizedOffset = Math.max(0, offset);
        int normalizedLimit = Math.min(Math.max(1, limit), 500);
        return auditQueryTimer.record(() -> loadAuditLogsPort.loadPage(normalizedOffset, normalizedLimit));
    }
}
