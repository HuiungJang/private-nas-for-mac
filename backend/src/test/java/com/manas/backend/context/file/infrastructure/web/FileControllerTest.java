package com.manas.backend.context.file.infrastructure.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.manas.backend.context.auth.domain.Role;
import com.manas.backend.context.auth.domain.User;
import com.manas.backend.context.file.application.port.in.DownloadFileUseCase;
import com.manas.backend.context.file.application.port.in.FileUploadUseCase;
import com.manas.backend.context.file.domain.FileContent;
import java.io.ByteArrayInputStream;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class FileControllerTest {

    private MockMvc mockMvc;

    @Mock
    private FileUploadUseCase fileUploadUseCase;

    @Mock
    private DownloadFileUseCase downloadFileUseCase;

    @BeforeEach
    void setUp() {
        FileController controller = new FileController(fileUploadUseCase, downloadFileUseCase);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .build();
    }

    @Test
    @DisplayName("Should download file with correct headers")
    void shouldDownloadFile() throws Exception {
        // Given
        UUID userId = UUID.randomUUID();
        User mockUser = User.restore(userId, "testuser", "hash", Set.of(Role.USER));

        var authorities = Set.of(new SimpleGrantedAuthority("ROLE_USER"));
        var auth = new UsernamePasswordAuthenticationToken(mockUser, null, authorities);

        // Manually set context for standalone setup (as filters aren't running)
        SecurityContextHolder.getContext().setAuthentication(auth);

        String path = "/test/doc.pdf";

        FileContent mockContent = new FileContent(
                "doc.pdf",
                "application/pdf",
                1024L,
                new ByteArrayInputStream(new byte[1024])
        );

        when(downloadFileUseCase.download(anyString(), any(UUID.class), anyString()))
                .thenReturn(mockContent);

        // When/Then
        try {
            mockMvc.perform(get("/api/files/download")
                            .param("path", path))
                    .andExpect(status().isOk())
                    .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"doc.pdf\""))
                    .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "application/pdf"))
                    .andExpect(header().string(HttpHeaders.CONTENT_LENGTH, "1024"));
        } finally {
            SecurityContextHolder.clearContext();
        }
    }
}
