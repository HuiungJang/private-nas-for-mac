package com.manas.backend.context.system.infrastructure.persistence.repository;

import com.manas.backend.context.system.infrastructure.persistence.entity.AuditLogEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaAuditLogRepository extends JpaRepository<AuditLogEntity, Long> {

    @Query(value = "SELECT * FROM audit_logs ORDER BY timestamp DESC, id DESC OFFSET :offset LIMIT :limit", nativeQuery = true)
    List<AuditLogEntity> findPageByOffsetLimit(@Param("offset") int offset, @Param("limit") int limit);
}
