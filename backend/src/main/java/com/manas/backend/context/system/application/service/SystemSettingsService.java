package com.manas.backend.context.system.application.service;

import com.manas.backend.context.system.application.port.in.GetSystemSettingsUseCase;
import com.manas.backend.context.system.application.port.in.UpdateThemeCommand;
import com.manas.backend.context.system.application.port.in.UpdateThemeUseCase;
import com.manas.backend.context.system.application.port.out.LoadSystemSettingsPort;
import com.manas.backend.context.system.application.port.out.SaveSystemSettingPort;
import com.manas.backend.context.system.domain.SystemSetting;
import com.manas.backend.context.system.infrastructure.web.dto.SystemSettingsResponse;
import com.manas.backend.context.system.infrastructure.web.dto.ThemeConfigDto;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j

@Service

@RequiredArgsConstructor

public class SystemSettingsService implements UpdateThemeUseCase, GetSystemSettingsUseCase {



    private final SaveSystemSettingPort saveSystemSettingPort;

    private final LoadSystemSettingsPort loadSystemSettingsPort;



    @Override

    @Transactional

    public void updateTheme(UpdateThemeCommand command) {

        log.info("Updating theme: Mode={}, Color={}", command.mode(), command.primaryColor());

        saveSystemSettingPort.save(new SystemSetting(SystemSetting.THEME_MODE_KEY, command.mode()));

        saveSystemSettingPort.save(
                new SystemSetting(SystemSetting.THEME_PRIMARY_COLOR_KEY, command.primaryColor()));

    }

    @Override

    @Transactional(readOnly = true)

    public SystemSettingsResponse getSettings() {

        List<SystemSetting> settings = loadSystemSettingsPort.loadAll();

        Map<String, String> settingsMap = settings.stream()

                .collect(Collectors.toMap(SystemSetting::key, SystemSetting::value));

        ThemeConfigDto themeConfig = new ThemeConfigDto(

                settingsMap.getOrDefault(SystemSetting.THEME_MODE_KEY, "light"), // Default to light

                settingsMap.getOrDefault(SystemSetting.THEME_PRIMARY_COLOR_KEY, "#007AFF") // Default Blue

        );

        return new SystemSettingsResponse(themeConfig);

    }

}


