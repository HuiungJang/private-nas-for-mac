package com.manas.backend.context.system.application.service;

import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.manas.backend.context.system.application.port.in.UpdateThemeCommand;
import com.manas.backend.context.system.application.port.out.SaveSystemSettingPort;
import com.manas.backend.context.system.domain.SystemSetting;
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

    private SystemSettingsService service;

    @BeforeEach
    void setUp() {
        service = new SystemSettingsService(saveSystemSettingPort);
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

}
