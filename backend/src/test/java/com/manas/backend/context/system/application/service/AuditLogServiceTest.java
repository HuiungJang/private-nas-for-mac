package com.manas.backend.context.system.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

import com.manas.backend.common.tracing.TraceConstants;
import com.manas.backend.context.system.application.port.out.SaveAuditLogPort;
import com.manas.backend.context.system.domain.AuditLog;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.MDC;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceTest {

    @Mock
    private SaveAuditLogPort saveAuditLogPort;

    @InjectMocks
    private AuditLogService auditLogService;

    @AfterEach
    void tearDown() {
        MDC.clear();
    }

    @Test
    @DisplayName("Should create and save audit log with TraceID from MDC")
    void record_Success() {
        // Given
        UUID userId = UUID.randomUUID();
        String action = "TEST_ACTION";
        String resource = "test_resource";
        String ip = "127.0.0.1";
        String status = "SUCCESS";
        String traceId = "trace-123";

        MDC.put(TraceConstants.TRACE_ID_MDC_KEY, traceId);

        // When
        auditLogService.record(userId, action, resource, ip, status);

        // Then
        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(saveAuditLogPort).save(captor.capture());

        AuditLog savedLog = captor.getValue();
        assertThat(savedLog.userId()).isEqualTo(userId);
        assertThat(savedLog.action()).isEqualTo(action);
        assertThat(savedLog.targetResource()).isEqualTo(resource);
        assertThat(savedLog.ipAddress()).isEqualTo(ip);
        assertThat(savedLog.status()).isEqualTo(status);
        assertThat(savedLog.traceId()).isEqualTo(traceId);
        assertThat(savedLog.timestamp()).isNotNull();
    }

    @Test
    @DisplayName("Should use UNKNOWN when TraceID is missing")
    void record_NoTraceId() {
        // Given
        UUID userId = UUID.randomUUID();
        // MDC is empty

        // When
        auditLogService.record(userId, "ACTION", "RES", "IP", "STATUS");

        // Then
        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(saveAuditLogPort).save(captor.capture());

        assertThat(captor.getValue().traceId()).isEqualTo("UNKNOWN");
    }

}
