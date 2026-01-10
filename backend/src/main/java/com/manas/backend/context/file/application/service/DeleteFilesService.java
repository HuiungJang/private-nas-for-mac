package com.manas.backend.context.file.application.service;

import com.manas.backend.context.file.application.port.in.DeleteFilesUseCase;
import com.manas.backend.context.file.application.port.out.FileStoragePort;
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

    @Override
    public void deleteFiles(List<String> paths, UUID userId) {
        log.info("User {} requested deletion of {} files", userId, paths.size());

        // TODO: This loop is not atomic. If the 3rd file fails, the first 2 are already deleted.
        // For a file system, true rollback is hard.
        // We could implement a "Trash" mechanism later (Soft Delete).
        for (String path : paths) {
            try {
                fileStoragePort.delete(path, userId);
            } catch (Exception e) {
                log.error("Failed to delete file: {}", path, e);
                // We choose to continue deleting others, or throw?
                // Usually for a batch delete, we might want to stop or return a report.
                // For now, let's fail fast to warn the user.
                throw e;
            }
        }
    }

}
