package com.manas.backend.context.system.infrastructure.persistence.repository;

import com.manas.backend.context.system.infrastructure.persistence.entity.SystemSettingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JpaSystemSettingRepository extends JpaRepository<SystemSettingEntity, String> {

}
