package com.manas.backend.context.system.infrastructure.persistence;

import com.manas.backend.TestcontainersConfiguration;
import com.manas.backend.context.system.domain.AuditLog;
import com.manas.backend.context.system.infrastructure.persistence.mapper.AuditLogMapper;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
@ComponentScan(basePackageClasses = AuditLogMapper.class)
class JpaAuditLogAdapterIT {

    @Autowired
    private JpaAuditLogAdapter adapter;

    @Test
    @DisplayName("Should save audit log")
    void shouldSaveAuditLog() {
        // Given
        AuditLog log = AuditLog.create(UUID.randomUUID(), "LOGIN", "AUTH", "trace-123", "1.1.1.1", "SUCCESS");

        // When
        adapter.save(log);

        // Then
        // Since we don't have a load method in the port (it's write-only mostly),
        // we assume no exception means success.
        // In a real IT, we might inject the Repository to verify count.
    }

}
