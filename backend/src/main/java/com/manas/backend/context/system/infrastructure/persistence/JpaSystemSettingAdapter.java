package com.manas.backend.context.system.infrastructure.persistence;

import com.manas.backend.context.system.application.port.out.LoadSystemSettingsPort;
import com.manas.backend.context.system.application.port.out.SaveSystemSettingPort;
import com.manas.backend.context.system.domain.SystemSetting;
import com.manas.backend.context.system.infrastructure.persistence.entity.SystemSettingEntity;
import com.manas.backend.context.system.infrastructure.persistence.repository.JpaSystemSettingRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component

@RequiredArgsConstructor

public class JpaSystemSettingAdapter implements SaveSystemSettingPort, LoadSystemSettingsPort {



    private final JpaSystemSettingRepository repository;

    @Override

    public void save(SystemSetting setting) {

        repository.save(new SystemSettingEntity(setting.key(), setting.value()));

    }

    @Override

    public List<SystemSetting> loadAll() {

        return repository.findAll().stream()

                .map(entity -> new SystemSetting(entity.getKey(), entity.getValue()))

                .toList();

    }

}


