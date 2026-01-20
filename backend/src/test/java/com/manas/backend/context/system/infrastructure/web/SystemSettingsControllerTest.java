package com.manas.backend.context.system.infrastructure.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.manas.backend.context.system.application.port.in.GetSystemSettingsUseCase;
import com.manas.backend.context.system.application.port.in.UpdateThemeCommand;
import com.manas.backend.context.system.application.port.in.UpdateThemeUseCase;
import com.manas.backend.context.system.infrastructure.web.dto.SystemSettingsResponse;
import com.manas.backend.context.system.infrastructure.web.dto.ThemeConfigDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class SystemSettingsControllerTest {

    private MockMvc mockMvc;

    @Mock
    private UpdateThemeUseCase updateThemeUseCase;
    @Mock
    private GetSystemSettingsUseCase getSystemSettingsUseCase;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        SystemSettingsController controller = new SystemSettingsController(updateThemeUseCase,
                getSystemSettingsUseCase);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("Should update theme successfully")
    void shouldUpdateTheme() throws Exception {
        // Given
        ThemeConfigDto request = new ThemeConfigDto("dark", "#FF5733");
        String json = objectMapper.writeValueAsString(request);

        // When/Then
        mockMvc.perform(put("/api/admin/settings/theme")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk());

        verify(updateThemeUseCase).updateTheme(any(UpdateThemeCommand.class));
    }

    @Test
    @DisplayName("Should fail validation for invalid color")
    void shouldFailValidation() throws Exception {
        // Given
        ThemeConfigDto request = new ThemeConfigDto("dark", "invalid-color");
        String json = objectMapper.writeValueAsString(request);

        // When/Then
        mockMvc.perform(put("/api/admin/settings/theme")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Should get settings")
    void shouldGetSettings() throws Exception {
        // Given
        ThemeConfigDto theme = new ThemeConfigDto("dark", "#000000");
        SystemSettingsResponse response = new SystemSettingsResponse(theme);

        when(getSystemSettingsUseCase.getSettings()).thenReturn(response);

        // When/Then
        mockMvc.perform(get("/api/admin/settings")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.theme.mode").value("dark"))
                .andExpect(jsonPath("$.theme.primaryColor").value("#000000"));
    }
}
