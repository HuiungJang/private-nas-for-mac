package com.manas.backend.context.system.infrastructure.web;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.manas.backend.context.system.application.port.in.GetSystemHealthUseCase;
import com.manas.backend.context.system.infrastructure.web.dto.SystemHealthDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class SystemMonitoringControllerTest {

    private MockMvc mockMvc;

    @Mock
    private GetSystemHealthUseCase getSystemHealthUseCase;

    @BeforeEach
    void setUp() {
        SystemMonitoringController controller = new SystemMonitoringController(getSystemHealthUseCase);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("Should return system health")
    void shouldReturnSystemHealth() throws Exception {
        // Given
        SystemHealthDto mockHealth = new SystemHealthDto(
                0.45,
                512000000L,
                1024000000L,
                10000000000L,
                50000000000L
        );
        when(getSystemHealthUseCase.getSystemHealth()).thenReturn(mockHealth);

        // When/Then
        mockMvc.perform(get("/api/admin/system/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cpuUsage").value(0.45))
                .andExpect(jsonPath("$.memoryUsed").value(512000000))
                .andExpect(jsonPath("$.storageTotal").value(50000000000L));
    }

}
