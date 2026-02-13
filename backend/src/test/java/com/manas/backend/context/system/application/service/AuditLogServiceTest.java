package com.manas.backend.context.system.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.manas.backend.common.tracing.TraceConstants;
import com.manas.backend.context.system.application.port.out.LoadAuditLogsPort;
import com.manas.backend.context.system.application.port.out.SaveAuditLogPort;
import com.manas.backend.context.system.domain.AuditLog;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.slf4j.MDC;

@ExtendWith(MockitoExtension.class)

class AuditLogServiceTest {

    @Mock

    private SaveAuditLogPort saveAuditLogPort;

    @Mock

    private LoadAuditLogsPort loadAuditLogsPort;



    private AuditLogService auditLogService;

    @BeforeEach
    void setUp() {

        auditLogService = new AuditLogService(saveAuditLogPort, loadAuditLogsPort);

    }

    @AfterEach
    void tearDown() {
        MDC.clear();
    }

    @Test

    @DisplayName("Should record audit log")
    void shouldRecordAuditLog() {

        // Given

        UUID userId = UUID.randomUUID();

        String action = "TEST_ACTION";

        String resource = "/test/resource";

        String ip = "127.0.0.1";

        String status = "SUCCESS";

        // When

        auditLogService.record(userId, action, resource, ip, status);

        // Then

        verify(saveAuditLogPort).save(any(AuditLog.class));

    }

    @Test
    @DisplayName("Should record audit log with traceId from MDC")
    void shouldRecordAuditLogWithTraceIdFromMdc() {
        UUID userId = UUID.randomUUID();
        String expectedTraceId = "trace-e2e-123";

        MDC.put(TraceConstants.TRACE_ID_MDC_KEY, expectedTraceId);

        auditLogService.record(userId, "DOWNLOAD_FILE", "/sample.txt", "127.0.0.1", "SUCCESS");

        ArgumentCaptor<AuditLog> captor = ArgumentCaptor.forClass(AuditLog.class);
        verify(saveAuditLogPort).save(captor.capture());

        AuditLog saved = captor.getValue();
        assertEquals(expectedTraceId, saved.traceId());
    }

    @Test

    @DisplayName("Should get all audit logs")
    void shouldGetAuditLogs() {

        // Given

        AuditLog log = AuditLog.create(UUID.randomUUID(), "LOGIN", "AUTH", "t1", "1.1.1.1", "OK");

        when(loadAuditLogsPort.loadAll()).thenReturn(List.of(log));

        // When

        List<AuditLog> result = auditLogService.getAuditLogs();

        // Then

        assertEquals(1, result.size());

        verify(loadAuditLogsPort).loadAll();

    }

}


