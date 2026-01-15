package com.manas.backend.context.system.application.service;

import com.manas.backend.context.system.application.port.in.UpdateThemeCommand;
import com.manas.backend.context.system.application.port.in.UpdateThemeUseCase;
import com.manas.backend.context.system.application.port.out.SaveSystemSettingPort;
import com.manas.backend.context.system.domain.SystemSetting;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SystemSettingsService implements UpdateThemeUseCase {

    private final SaveSystemSettingPort saveSystemSettingPort;

    @Override
    @Transactional
    public void updateTheme(UpdateThemeCommand command) {
        log.info("Updating theme: Mode={}, Color={}", command.mode(), command.primaryColor());

        saveSystemSettingPort.save(new SystemSetting(SystemSetting.THEME_MODE_KEY, command.mode()));
        saveSystemSettingPort.save(
                new SystemSetting(SystemSetting.THEME_PRIMARY_COLOR_KEY, command.primaryColor()));
    }

}
