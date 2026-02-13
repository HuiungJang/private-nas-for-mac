package com.manas.backend.context.system.infrastructure.persistence.repository;

import com.manas.backend.context.system.infrastructure.persistence.entity.AuditLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaAuditLogRepository extends JpaRepository<AuditLogEntity, Long> {

    Page<AuditLogEntity> findAllByOrderByTimestampDesc(Pageable pageable);
}
