package com.manas.backend.context.file.application.service;

import com.manas.backend.context.file.application.port.in.CreateDirectoryUseCase;
import com.manas.backend.context.file.application.port.out.FileStoragePort;
import com.manas.backend.context.system.application.port.in.RecordAuditLogUseCase;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class CreateDirectoryService implements CreateDirectoryUseCase {

    private final FileStoragePort fileStoragePort;
    private final RecordAuditLogUseCase recordAuditLogUseCase;

    @Override
    public void createDirectory(String parentPath, String name, UUID userId) {
        String safeParent = (parentPath == null || parentPath.isBlank()) ? "/" : parentPath;
        String safeName = (name == null) ? "" : name.trim();

        if (safeName.isEmpty()) {
            throw new IllegalArgumentException("Directory name is required");
        }
        if (safeName.contains("/") || safeName.contains("\\")) {
            throw new IllegalArgumentException("Directory name must not contain path separators");
        }
        if (".".equals(safeName) || "..".equals(safeName)) {
            throw new IllegalArgumentException("Invalid directory name");
        }

        String normalizedParent = safeParent.endsWith("/") ? safeParent : safeParent + "/";
        String targetPath = normalizedParent + safeName;

        try {
            fileStoragePort.createDirectory(targetPath, userId);
            recordAuditLogUseCase.record(userId, "CREATE_DIRECTORY", targetPath, "N/A", "SUCCESS");
            log.info("User {} created directory: {}", userId, targetPath);
        } catch (RuntimeException e) {
            recordAuditLogUseCase.record(userId, "CREATE_DIRECTORY", targetPath, "N/A", "FAILURE");
            throw e;
        }
    }
}
