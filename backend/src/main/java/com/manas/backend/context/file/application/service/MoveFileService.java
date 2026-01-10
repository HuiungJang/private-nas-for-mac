package com.manas.backend.context.file.application.service;

import com.manas.backend.context.file.application.port.in.MoveFileUseCase;
import com.manas.backend.context.file.application.port.out.FileStoragePort;
import com.manas.backend.context.system.application.port.in.RecordAuditLogUseCase;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MoveFileService implements MoveFileUseCase {

    private final FileStoragePort fileStoragePort;
    private final RecordAuditLogUseCase recordAuditLogUseCase;

    @Override
    public void moveFile(String sourcePath, String destinationPath, UUID userId) {
        log.info("User {} requested move: {} -> {}", userId, sourcePath, destinationPath);
        String targetInfo = sourcePath + " -> " + destinationPath;
        try {
            fileStoragePort.move(sourcePath, destinationPath, userId);
            recordAuditLogUseCase.record(userId, "MOVE_FILE", targetInfo, "N/A", "SUCCESS");
        } catch (Exception e) {
            log.error("Failed to move file: {}", targetInfo, e);
            recordAuditLogUseCase.record(userId, "MOVE_FILE", targetInfo, "N/A", "FAILURE");
            throw e;
        }
    }

}
