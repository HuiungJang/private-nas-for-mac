package com.manas.backend.context.file.infrastructure.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.manas.backend.context.file.application.port.in.FileUploadCommand;
import com.manas.backend.context.file.application.port.in.FileUploadUseCase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

@ExtendWith(MockitoExtension.class)
class FileControllerTest {

    private MockMvc mockMvc;

    @Mock
    private FileUploadUseCase fileUploadUseCase;

    @InjectMocks
    private FileController fileController;

    @BeforeEach
    void setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(fileController).build();
    }

    @Test
    void uploadFile_ShouldReturnCreated_WhenValid() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.txt",
                MediaType.TEXT_PLAIN_VALUE,
                "Hello, World!".getBytes()
        );

        mockMvc.perform(multipart("/api/files/upload")
                        .file(file)
                        .param("directory", "/docs"))
                //.with(csrf()) // Standalone setup doesn't need CSRF/Security context usually
                .andExpect(status().isCreated());

        verify(fileUploadUseCase).upload(any(FileUploadCommand.class));
    }

    @Test
    void uploadFile_ShouldReturnBadRequest_WhenFileMissing() throws Exception {
        mockMvc.perform(multipart("/api/files/upload")
                        .param("directory", "/docs"))
                .andExpect(status().isBadRequest());
    }

}
