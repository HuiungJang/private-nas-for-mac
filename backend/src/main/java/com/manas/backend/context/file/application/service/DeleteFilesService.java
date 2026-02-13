package com.manas.backend.context.file.application.service;

import com.manas.backend.context.file.application.port.in.DeleteFilesResult;
import com.manas.backend.context.file.application.port.in.DeleteFilesUseCase;
import com.manas.backend.context.file.application.port.out.FileStoragePort;
import com.manas.backend.context.system.application.port.in.RecordAuditLogUseCase;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeleteFilesService implements DeleteFilesUseCase {

    private final FileStoragePort fileStoragePort;
    private final RecordAuditLogUseCase recordAuditLogUseCase;

    @Override
    public DeleteFilesResult deleteFiles(List<String> paths, UUID userId) {
        log.info("User {} requested deletion of {} files", userId, paths.size());

        List<String> deleted = new ArrayList<>();
        List<DeleteFilesResult.DeleteFailure> failed = new ArrayList<>();

        for (String path : paths) {
            try {
                fileStoragePort.delete(path, userId);
                recordAuditLogUseCase.record(userId, "DELETE_FILE", path, "N/A", "SUCCESS");
                deleted.add(path);
            } catch (RuntimeException e) {
                log.error("Failed to delete file: {}", path, e);
                recordAuditLogUseCase.record(userId, "DELETE_FILE", path, "N/A", "FAILURE");
                failed.add(new DeleteFilesResult.DeleteFailure(path, e.getMessage()));
            }
        }

        return new DeleteFilesResult(deleted, failed);
    }
}
