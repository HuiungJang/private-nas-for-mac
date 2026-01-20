package com.manas.backend.context.system.application.service;

import com.manas.backend.context.auth.domain.event.IpAccessChangedEvent;
import com.manas.backend.context.system.application.port.in.GetSystemSettingsUseCase;
import com.manas.backend.context.system.application.port.in.UpdateIpAccessCommand;
import com.manas.backend.context.system.application.port.in.UpdateIpAccessUseCase;
import com.manas.backend.context.system.application.port.in.UpdateThemeCommand;
import com.manas.backend.context.system.application.port.in.UpdateThemeUseCase;
import com.manas.backend.context.system.application.port.out.LoadSystemSettingsPort;
import com.manas.backend.context.system.application.port.out.SaveSystemSettingPort;
import com.manas.backend.context.system.domain.SystemSetting;
import com.manas.backend.context.system.infrastructure.adapter.SystemIpConfigurationAdapter;
import com.manas.backend.context.system.infrastructure.web.dto.IpAccessConfigDto;
import com.manas.backend.context.system.infrastructure.web.dto.SystemSettingsResponse;
import com.manas.backend.context.system.infrastructure.web.dto.ThemeConfigDto;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.web.util.matcher.IpAddressMatcher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j

@Service

@RequiredArgsConstructor

public class SystemSettingsService implements UpdateThemeUseCase, GetSystemSettingsUseCase,
        UpdateIpAccessUseCase {



    private final SaveSystemSettingPort saveSystemSettingPort;

    private final LoadSystemSettingsPort loadSystemSettingsPort;

    private final ApplicationEventPublisher eventPublisher;



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

        String ipListStr = settingsMap.getOrDefault(SystemIpConfigurationAdapter.IP_ALLOWED_SUBNETS_KEY, "");

        List<String> allowedSubnets = ipListStr.isBlank() ? List.of() : Arrays.asList(ipListStr.split(","));

        IpAccessConfigDto ipConfig = new IpAccessConfigDto(allowedSubnets);

        return new SystemSettingsResponse(themeConfig, ipConfig);

    }

    @Override

    @Transactional

    public void updateIpAccess(UpdateIpAccessCommand command) {

        log.info("Updating IP Access List: {}", command.allowedSubnets());

        // Validate Lockout

        boolean isSafe = command.allowedSubnets().stream()

                .map(IpAddressMatcher::new)

                .anyMatch(matcher -> matcher.matches(command.currentUserIp()));

        if (!isSafe) {

            log.warn("Prevented IP Access update that would lock out current user: {}",
                    command.currentUserIp());

            throw new IllegalArgumentException(
                    "Invalid configuration: Your current IP (" + command.currentUserIp()
                    + ") is not included in the allowed list.");

        }

        String value = String.join(",", command.allowedSubnets());

        saveSystemSettingPort.save(
                new SystemSetting(SystemIpConfigurationAdapter.IP_ALLOWED_SUBNETS_KEY, value));

        eventPublisher.publishEvent(new IpAccessChangedEvent());

    }

}




