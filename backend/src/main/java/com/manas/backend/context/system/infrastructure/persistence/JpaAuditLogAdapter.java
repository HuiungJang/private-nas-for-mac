package com.manas.backend.context.system.infrastructure.persistence;

import com.manas.backend.context.system.application.port.out.SaveAuditLogPort;
import com.manas.backend.context.system.domain.AuditLog;
import com.manas.backend.context.system.infrastructure.persistence.mapper.AuditLogMapper;
import com.manas.backend.context.system.infrastructure.persistence.repository.JpaAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JpaAuditLogAdapter implements SaveAuditLogPort {

    private final JpaAuditLogRepository jpaAuditLogRepository;
    private final AuditLogMapper auditLogMapper;

    @Override
    public void save(AuditLog auditLog) {
        jpaAuditLogRepository.save(auditLogMapper.toEntity(auditLog));
    }

}
