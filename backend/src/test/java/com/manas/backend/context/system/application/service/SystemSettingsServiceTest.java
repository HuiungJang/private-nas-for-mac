package com.manas.backend.context.system.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.manas.backend.context.system.application.port.in.UpdateThemeCommand;
import com.manas.backend.context.system.application.port.out.LoadSystemSettingsPort;
import com.manas.backend.context.system.application.port.out.SaveSystemSettingPort;
import com.manas.backend.context.system.domain.SystemSetting;
import com.manas.backend.context.system.infrastructure.web.dto.SystemSettingsResponse;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)

class SystemSettingsServiceTest {

    @Mock

    private SaveSystemSettingPort saveSystemSettingPort;

    @Mock

    private LoadSystemSettingsPort loadSystemSettingsPort;



    private SystemSettingsService service;

    @BeforeEach
    void setUp() {

        service = new SystemSettingsService(saveSystemSettingPort, loadSystemSettingsPort);

    }

    @Test

    @DisplayName("Should update theme settings")
    void shouldUpdateTheme() {

        // Given

        UpdateThemeCommand command = new UpdateThemeCommand("dark", "#000000");

        // When

        service.updateTheme(command);

        // Then

        verify(saveSystemSettingPort, times(2)).save(argThat(setting ->

                (setting.key().equals(SystemSetting.THEME_MODE_KEY) && setting.value().equals("dark")) ||

                (setting.key().equals(SystemSetting.THEME_PRIMARY_COLOR_KEY) && setting.value()
                        .equals("#000000"))

        ));

    }

    @Test

    @DisplayName("Should return settings with defaults if empty")
    void shouldReturnDefaultSettings() {

        // Given

        when(loadSystemSettingsPort.loadAll()).thenReturn(Collections.emptyList());

        // When

        SystemSettingsResponse response = service.getSettings();

        // Then

        assertNotNull(response);

        assertEquals("light", response.theme().mode());

        assertEquals("#007AFF", response.theme().primaryColor());

    }

    @Test

    @DisplayName("Should return stored settings")
    void shouldReturnStoredSettings() {

        // Given

        List<SystemSetting> settings = List.of(

                new SystemSetting(SystemSetting.THEME_MODE_KEY, "dark"),

                new SystemSetting(SystemSetting.THEME_PRIMARY_COLOR_KEY, "#FF0000")

        );

        when(loadSystemSettingsPort.loadAll()).thenReturn(settings);

        // When

        SystemSettingsResponse response = service.getSettings();

        // Then

        assertNotNull(response);

        assertEquals("dark", response.theme().mode());

        assertEquals("#FF0000", response.theme().primaryColor());

    }

}


