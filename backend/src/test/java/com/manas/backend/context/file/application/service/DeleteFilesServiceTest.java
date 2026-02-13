package com.manas.backend.context.file.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.willDoNothing;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.verify;

import com.manas.backend.context.file.application.port.in.DeleteFilesResult;
import com.manas.backend.context.file.application.port.out.FileStoragePort;
import com.manas.backend.context.system.application.port.in.RecordAuditLogUseCase;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class DeleteFilesServiceTest {

    @Mock
    private FileStoragePort fileStoragePort;
    @Mock
    private RecordAuditLogUseCase recordAuditLogUseCase;

    @InjectMocks
    private DeleteFilesService deleteFilesService;

    @Test
    @DisplayName("Should delete files and record success audit log")
    void deleteFiles_Success() {
        UUID userId = UUID.randomUUID();
        String path1 = "/path/to/file1.txt";
        String path2 = "/path/to/file2.txt";
        List<String> paths = List.of(path1, path2);

        willDoNothing().given(fileStoragePort).delete(path1, userId);
        willDoNothing().given(fileStoragePort).delete(path2, userId);

        DeleteFilesResult result = deleteFilesService.deleteFiles(paths, userId);

        assertThat(result.deleted()).containsExactly(path1, path2);
        assertThat(result.failed()).isEmpty();

        verify(fileStoragePort).delete(path1, userId);
        verify(recordAuditLogUseCase).record(userId, "DELETE_FILE", path1, "N/A", "SUCCESS");

        verify(fileStoragePort).delete(path2, userId);
        verify(recordAuditLogUseCase).record(userId, "DELETE_FILE", path2, "N/A", "SUCCESS");
    }

    @Test
    @DisplayName("Should continue delete and return failure report when one deletion fails")
    void deleteFiles_Failure() {
        UUID userId = UUID.randomUUID();
        String path1 = "/path/to/success.txt";
        String path2 = "/path/to/fail.txt";
        List<String> paths = List.of(path1, path2);

        willDoNothing().given(fileStoragePort).delete(path1, userId);
        willThrow(new RuntimeException("IO Error")).given(fileStoragePort).delete(path2, userId);

        DeleteFilesResult result = deleteFilesService.deleteFiles(paths, userId);

        assertThat(result.deleted()).containsExactly(path1);
        assertThat(result.failed()).hasSize(1);
        assertThat(result.failed().getFirst().path()).isEqualTo(path2);
        assertThat(result.failed().getFirst().reason()).contains("IO Error");

        verify(fileStoragePort).delete(path1, userId);
        verify(recordAuditLogUseCase).record(userId, "DELETE_FILE", path1, "N/A", "SUCCESS");

        verify(fileStoragePort).delete(path2, userId);
        verify(recordAuditLogUseCase).record(userId, "DELETE_FILE", path2, "N/A", "FAILURE");
    }
}
