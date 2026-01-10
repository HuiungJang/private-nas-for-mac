package com.manas.backend.context.file.application.service;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.willDoNothing;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.verify;

import com.manas.backend.context.file.application.port.out.FileStoragePort;
import com.manas.backend.context.system.application.port.in.RecordAuditLogUseCase;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MoveFileServiceTest {

    @Mock
    private FileStoragePort fileStoragePort;
    @Mock
    private RecordAuditLogUseCase recordAuditLogUseCase;

    @InjectMocks
    private MoveFileService moveFileService;

    @Test
    @DisplayName("Should move file and record audit log on success")
    void moveFile_Success() {
        // Given
        UUID userId = UUID.randomUUID();
        String src = "/src/file.txt";
        String dest = "/dest/file.txt";

        willDoNothing().given(fileStoragePort).move(src, dest, userId);

        // When
        moveFileService.moveFile(src, dest, userId);

        // Then
        verify(fileStoragePort).move(src, dest, userId);
        verify(recordAuditLogUseCase).record(userId, "MOVE_FILE", src + " -> " + dest, "N/A", "SUCCESS");
    }

    @Test
    @DisplayName("Should record failure audit log when move fails")
    void moveFile_Failure() {
        // Given
        UUID userId = UUID.randomUUID();
        String src = "/src/file.txt";
        String dest = "/dest/file.txt";

        willThrow(new RuntimeException("IO Error")).given(fileStoragePort).move(src, dest, userId);

        // When & Then
        assertThatThrownBy(() -> moveFileService.moveFile(src, dest, userId))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("IO Error");

        verify(recordAuditLogUseCase).record(userId, "MOVE_FILE", src + " -> " + dest, "N/A", "FAILURE");
    }

}
