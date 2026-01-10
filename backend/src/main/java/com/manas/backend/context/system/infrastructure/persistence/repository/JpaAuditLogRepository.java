package com.manas.backend.context.system.infrastructure.persistence.repository;

import com.manas.backend.context.system.infrastructure.persistence.entity.AuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaAuditLogRepository extends JpaRepository<AuditLogEntity, Long> {

}
