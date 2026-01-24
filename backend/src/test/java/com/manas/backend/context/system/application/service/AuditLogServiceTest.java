package com.manas.backend.context.system.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.manas.backend.context.system.application.port.out.LoadAuditLogsPort;
import com.manas.backend.context.system.application.port.out.SaveAuditLogPort;
import com.manas.backend.context.system.domain.AuditLog;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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


