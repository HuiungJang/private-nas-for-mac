package com.manas.backend.context.file.application.service;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.manas.backend.context.file.application.port.out.FileStoragePort;
import com.manas.backend.context.file.application.port.out.PreviewGeneratorPort;
import com.manas.backend.context.file.domain.FileContent;
import com.manas.backend.context.file.domain.PreviewType;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.util.UUID;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class PreviewServiceTest {

    @TempDir
    Path tempCacheDir;
    @Mock
    private FileStoragePort fileStoragePort;
    @Mock
    private PreviewGeneratorPort previewGeneratorPort;
    @Mock
    private MeterRegistry meterRegistry;
    @Mock
    private Counter counter;
    private PreviewService previewService;
    private UUID userId;

    @BeforeEach
    void setUp() {
        when(meterRegistry.counter(any())).thenReturn(counter);
        previewService = new PreviewService(fileStoragePort, previewGeneratorPort, meterRegistry,
                tempCacheDir.toString());
        userId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Should return cached preview if exists")
    void shouldReturnCachedPreview() throws IOException {
        // Given
        String path = "/images/existing.jpg";
        // Calculate expected hash (SHA-256 of path) manually or trust logic
        // But simpler: Run once to populate cache, then mock dependencies to fail if called, and run again.

        // Let's rely on the service to generate the key.
        // But to test "hit", I must manually place a file where the service expects it.
        // Since `generateCacheKey` is private, I can't call it.
        // I'll trust the logic: SHA-256 hex + ".jpg".

        // But to avoid reimplementing hash logic in test, I will use a different approach:
        // Call getPreview once (Miss), verify generation.
        // Call getPreview again (Hit), verify no generation.

        FileContent source = new FileContent("existing.jpg", "image/jpeg", 100,
                new ByteArrayInputStream(new byte[100]));
        FileContent generated = new FileContent("thumb.jpg", "image/jpeg", 50,
                new ByteArrayInputStream(new byte[]{1, 2, 3}));

        when(fileStoragePort.retrieve(path, userId)).thenReturn(source);
        when(previewGeneratorPort.supports("image/jpeg")).thenReturn(true);
        when(previewGeneratorPort.generate(any(), eq(PreviewType.THUMBNAIL))).thenReturn(generated);

        // When (First Call - Miss)
        FileContent result1 = previewService.getPreview(path, userId);

        // Then
        assertNotNull(result1);
        verify(previewGeneratorPort).generate(any(), eq(PreviewType.THUMBNAIL));

        // When (Second Call - Hit)
        // Reset mocks to ensure they aren't called
        org.mockito.Mockito.clearInvocations(fileStoragePort, previewGeneratorPort);

        FileContent result2 = previewService.getPreview(path, userId);

        // Then
        assertNotNull(result2);
        verify(fileStoragePort, never()).retrieve(any(), any());
        verify(previewGeneratorPort, never()).generate(any(), any());

        byte[] content1 = result1.inputStream().readAllBytes();
        byte[] content2 = result2.inputStream().readAllBytes();
        assertArrayEquals(new byte[]{1, 2, 3}, content1);
        assertArrayEquals(new byte[]{1, 2, 3}, content2);
    }

    @Test
    @DisplayName("Should return original if generation fails but is image")
    void shouldReturnOriginalIfGenerationFails() {
        String path = "/images/corrupt.jpg";
        FileContent source = new FileContent("corrupt.jpg", "image/jpeg", 100,
                new ByteArrayInputStream(new byte[]{9, 9, 9}));

        when(fileStoragePort.retrieve(path, userId)).thenReturn(source);
        when(previewGeneratorPort.supports("image/jpeg")).thenReturn(true);
        when(previewGeneratorPort.generate(any(), any())).thenReturn(null); // Failed

        FileContent result = previewService.getPreview(path, userId);

        assertEquals(source, result);
    }

}
