package com.manas.backend.context.file.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.manas.backend.context.file.application.port.out.FileStoragePort;
import com.manas.backend.context.file.domain.FileContent;
import com.manas.backend.context.system.application.port.in.RecordAuditLogUseCase;
import java.io.ByteArrayInputStream;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DownloadFileServiceTest {

    @Mock
    private FileStoragePort fileStoragePort;

    @Mock
    private RecordAuditLogUseCase recordAuditLogUseCase;

    @InjectMocks
    private DownloadFileService downloadFileService;

    private UUID userId;
    private String clientIp;
    private String path;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        clientIp = "127.0.0.1";
        path = "/test/file.txt";
    }

    @Test
    @DisplayName("Should retrieve file content and record audit log on success")
    void shouldDownloadAndAudit() {
        // Given
        FileContent expectedContent = new FileContent(
                "file.txt",
                "text/plain",
                100L,
                new ByteArrayInputStream(new byte[0])
        );

        when(fileStoragePort.retrieve(path, userId)).thenReturn(expectedContent);

        // When
        FileContent result = downloadFileService.download(path, userId, clientIp);

        // Then
        assertNotNull(result);
        assertEquals(expectedContent, result);

        verify(fileStoragePort).retrieve(path, userId);
        verify(recordAuditLogUseCase).record(
                eq(userId),
                eq("DOWNLOAD"),
                eq(path),
                eq(clientIp),
                eq("SUCCESS")
        );
    }

    @Test
    @DisplayName("Should propagate exception and not record success audit if retrieval fails")
    void shouldPropagateException() {
        // Given
        when(fileStoragePort.retrieve(path, userId)).thenThrow(
                new IllegalArgumentException("File not found"));

        // When/Then
        assertThrows(IllegalArgumentException.class, () ->
                downloadFileService.download(path, userId, clientIp)
        );

        verify(recordAuditLogUseCase, never()).record(any(), any(), any(), any(), any());
    }

}
