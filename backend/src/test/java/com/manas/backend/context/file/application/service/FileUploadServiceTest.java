package com.manas.backend.context.file.application.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.anyLong;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.manas.backend.context.file.application.port.in.FileUploadCommand;
import com.manas.backend.context.file.application.port.out.FileStoragePort;
import com.manas.backend.context.file.domain.FileContent;
import com.manas.backend.context.file.domain.FileValidator;
import com.manas.backend.context.file.domain.event.FileUploadedEvent;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
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
        UUID userId = UUID.randomUUID();
        String fileName = "test.txt";
        String dir = "/documents";
        long size = 100L;
        ByteArrayInputStream content = new ByteArrayInputStream(new byte[0]);

        FileUploadCommand command = new FileUploadCommand(content, fileName, dir, size, userId, null);

        when(fileStoragePort.getAvailableDiskSpace()).thenReturn(10L * 1024 * 1024 * 1024);

        service.upload(command);

        verify(fileValidator).validate(fileName, size);
        verify(fileStoragePort).save(eq(content), eq("/documents/test.txt"), eq(size), eq(userId));
        verify(eventPublisher).publishEvent(any(FileUploadedEvent.class));
    }

    @Test
    void upload_ShouldFail_WhenValidationFails() {
        FileUploadCommand command = new FileUploadCommand(null, "", "", 0, null, null);
        doThrow(new IllegalArgumentException("Invalid")).when(fileValidator).validate(any(), anyLong());

        assertThrows(IllegalArgumentException.class, () -> service.upload(command));

        verifyNoInteractions(eventPublisher);
    }

    @Test
    void upload_ShouldFail_WhenInsufficientDiskSpace() {
        UUID userId = UUID.randomUUID();
        String fileName = "large_file.bin";
        String dir = "/documents";
        long size = 5L * 1024 * 1024 * 1024;
        ByteArrayInputStream content = new ByteArrayInputStream(new byte[0]);

        FileUploadCommand command = new FileUploadCommand(content, fileName, dir, size, userId, null);

        when(fileStoragePort.getAvailableDiskSpace()).thenReturn((long) 1024 * 1024 * 1024);

        assertThrows(IllegalStateException.class, () -> service.upload(command));

        verify(fileStoragePort).getAvailableDiskSpace();
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void upload_ShouldPass_WhenChecksumMatches() {
        UUID userId = UUID.randomUUID();
        byte[] uploaded = "hello".getBytes(StandardCharsets.UTF_8);
        String expectedSha256 = "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824";

        FileUploadCommand command = new FileUploadCommand(
                new ByteArrayInputStream(uploaded),
                "hello.txt",
                "/documents",
                uploaded.length,
                userId,
                expectedSha256
        );

        when(fileStoragePort.getAvailableDiskSpace()).thenReturn(10L * 1024 * 1024 * 1024);
        when(fileStoragePort.retrieve("/documents/hello.txt", userId))
                .thenReturn(new FileContent("hello.txt", "text/plain", uploaded.length, new ByteArrayInputStream(uploaded)));

        service.upload(command);

        verify(fileStoragePort).save(any(), eq("/documents/hello.txt"), eq((long) uploaded.length), eq(userId));
        verify(fileStoragePort, never()).delete(any(), any());
        verify(eventPublisher).publishEvent(any(FileUploadedEvent.class));
    }

    @Test
    void upload_ShouldRollback_WhenChecksumMismatch() {
        UUID userId = UUID.randomUUID();
        byte[] uploaded = "hello".getBytes(StandardCharsets.UTF_8);

        FileUploadCommand command = new FileUploadCommand(
                new ByteArrayInputStream(uploaded),
                "hello.txt",
                "/documents",
                uploaded.length,
                userId,
                "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        );

        when(fileStoragePort.getAvailableDiskSpace()).thenReturn(10L * 1024 * 1024 * 1024);
        when(fileStoragePort.retrieve("/documents/hello.txt", userId))
                .thenReturn(new FileContent("hello.txt", "text/plain", uploaded.length, new ByteArrayInputStream(uploaded)));

        assertThrows(IllegalArgumentException.class, () -> service.upload(command));

        verify(fileStoragePort).delete("/documents/hello.txt", userId);
        verifyNoInteractions(eventPublisher);
    }
}
