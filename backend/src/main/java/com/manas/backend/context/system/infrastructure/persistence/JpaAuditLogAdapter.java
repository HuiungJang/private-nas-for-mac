package com.manas.backend.context.system.infrastructure.persistence;

import com.manas.backend.context.system.application.port.out.LoadAuditLogsPort;
import com.manas.backend.context.system.application.port.out.SaveAuditLogPort;
import com.manas.backend.context.system.domain.AuditLog;
import com.manas.backend.context.system.infrastructure.persistence.mapper.AuditLogMapper;
import com.manas.backend.context.system.infrastructure.persistence.repository.JpaAuditLogRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JpaAuditLogAdapter implements SaveAuditLogPort, LoadAuditLogsPort {

    private final JpaAuditLogRepository jpaAuditLogRepository;
    private final AuditLogMapper auditLogMapper;

    @Override
    public void save(AuditLog auditLog) {
        jpaAuditLogRepository.save(auditLogMapper.toEntity(auditLog));
    }

    @Override
    public List<AuditLog> loadPage(int offset, int limit) {
        int page = offset / limit;
        int inPageOffset = offset % limit;
        int fetchSize = limit + inPageOffset;

        return jpaAuditLogRepository.findAllByOrderByTimestampDesc(PageRequest.of(page, fetchSize)).stream()
                .skip(inPageOffset)
                .limit(limit)
                .map(auditLogMapper::toDomain)
                .toList();
    }
}
