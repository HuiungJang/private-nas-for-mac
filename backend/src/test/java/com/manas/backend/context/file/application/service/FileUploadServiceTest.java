package com.manas.backend.context.file.application.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.anyLong;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.manas.backend.context.file.application.port.in.FileUploadCommand;
import com.manas.backend.context.file.application.port.out.FileStoragePort;
import com.manas.backend.context.file.domain.FileValidator;
import com.manas.backend.context.file.domain.event.FileUploadedEvent;
import java.io.ByteArrayInputStream;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

@ExtendWith(MockitoExtension.class)
class FileUploadServiceTest {

    @Mock
    private FileStoragePort fileStoragePort;

    @Mock
    private FileValidator fileValidator;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @InjectMocks
    private FileUploadService service;

    @Test
    void upload_ShouldValidateAndSaveAndPublishEvent() {
        // Arrange
        UUID userId = UUID.randomUUID();
        String fileName = "test.txt";
        String dir = "/documents";
        long size = 100L;
        ByteArrayInputStream content = new ByteArrayInputStream(new byte[0]);

        FileUploadCommand command = new FileUploadCommand(content, fileName, dir, size, userId);

        // Mock sufficient disk space (10GB available)
        when(fileStoragePort.getAvailableDiskSpace()).thenReturn(10L * 1024 * 1024 * 1024);

        // Act
        service.upload(command);

        // Assert
        verify(fileValidator).validate(fileName, size);
        verify(fileStoragePort).save(eq(content), eq("/documents/test.txt"), eq(size), eq(userId));
        verify(eventPublisher).publishEvent(any(FileUploadedEvent.class));
    }

    @Test
    void upload_ShouldFail_WhenValidationFails() {
        // Arrange
        FileUploadCommand command = new FileUploadCommand(null, "", "", 0, null);
        doThrow(new IllegalArgumentException("Invalid")).when(fileValidator).validate(any(), anyLong());

        // Act & Assert
        org.junit.jupiter.api.Assertions.assertThrows(IllegalArgumentException.class, () ->
                service.upload(command)
        );

        verifyNoInteractions(eventPublisher);
    }

    @Test
    void upload_ShouldFail_WhenInsufficientDiskSpace() {
        // Arrange
        UUID userId = UUID.randomUUID();
        String fileName = "large_file.bin";
        String dir = "/documents";
        long size = 5L * 1024 * 1024 * 1024; // 5GB file
        ByteArrayInputStream content = new ByteArrayInputStream(new byte[0]);

        FileUploadCommand command = new FileUploadCommand(content, fileName, dir, size, userId);

        // Mock insufficient disk space (only 1GB available)
        when(fileStoragePort.getAvailableDiskSpace()).thenReturn((long) 1024 * 1024 * 1024);

        // Act & Assert
        org.junit.jupiter.api.Assertions.assertThrows(IllegalStateException.class, () ->
                service.upload(command)
        );

        // Verify save was never called
        verify(fileStoragePort).getAvailableDiskSpace();
        verifyNoInteractions(eventPublisher);
    }

}
