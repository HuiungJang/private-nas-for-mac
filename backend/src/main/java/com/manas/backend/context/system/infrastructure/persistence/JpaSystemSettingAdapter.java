package com.manas.backend.context.system.infrastructure.persistence;

import com.manas.backend.context.system.application.port.out.SaveSystemSettingPort;
import com.manas.backend.context.system.domain.SystemSetting;
import com.manas.backend.context.system.infrastructure.persistence.entity.SystemSettingEntity;
import com.manas.backend.context.system.infrastructure.persistence.repository.JpaSystemSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class JpaSystemSettingAdapter implements SaveSystemSettingPort {

    private final JpaSystemSettingRepository repository;

    @Override
    public void save(SystemSetting setting) {
        repository.save(new SystemSettingEntity(setting.key(), setting.value()));
    }

}
