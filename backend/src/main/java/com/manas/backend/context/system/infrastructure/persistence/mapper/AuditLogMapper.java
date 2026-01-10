package com.manas.backend.context.system.infrastructure.persistence.mapper;

import com.manas.backend.context.system.domain.AuditLog;
import com.manas.backend.context.system.infrastructure.persistence.entity.AuditLogEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface AuditLogMapper {

    AuditLogEntity toEntity(AuditLog domain);

    AuditLog toDomain(AuditLogEntity entity);

}
