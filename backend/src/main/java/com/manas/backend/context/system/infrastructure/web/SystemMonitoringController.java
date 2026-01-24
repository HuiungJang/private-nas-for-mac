package com.manas.backend.context.system.infrastructure.web;

import com.manas.backend.context.system.application.port.in.GetAuditLogsUseCase;
import com.manas.backend.context.system.application.port.in.GetSystemHealthUseCase;
import com.manas.backend.context.system.domain.AuditLog;
import com.manas.backend.context.system.infrastructure.web.dto.AuditLogDto;
import com.manas.backend.context.system.infrastructure.web.dto.SystemHealthDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/system")
@RequiredArgsConstructor
public class SystemMonitoringController {

    private final GetSystemHealthUseCase getSystemHealthUseCase;
    private final GetAuditLogsUseCase getAuditLogsUseCase;

    @GetMapping("/health")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemHealthDto> getSystemHealth() {
        return ResponseEntity.ok(getSystemHealthUseCase.getSystemHealth());
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLogDto>> getAuditLogs() {
        List<AuditLog> logs = getAuditLogsUseCase.getAuditLogs();
        List<AuditLogDto> dtos = logs.stream()
                .map(this::toDto)
                .toList();
        return ResponseEntity.ok(dtos);
    }

    private AuditLogDto toDto(AuditLog log) {
        return new AuditLogDto(
                log.id(),
                log.userId(),
                log.action(),
                log.targetResource(),
                log.traceId(),
                log.ipAddress(),
                log.timestamp(),
                log.status()
        );
    }
}
