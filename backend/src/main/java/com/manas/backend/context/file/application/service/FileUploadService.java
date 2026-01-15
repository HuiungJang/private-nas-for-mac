package com.manas.backend.context.file.application.service;

import com.manas.backend.context.file.application.port.in.FileUploadCommand;
import com.manas.backend.context.file.application.port.in.FileUploadUseCase;
import com.manas.backend.context.file.application.port.out.FileStoragePort;
import com.manas.backend.context.file.domain.FileValidator;
import com.manas.backend.context.file.domain.event.FileUploadedEvent;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileUploadService implements FileUploadUseCase {

    private final FileStoragePort fileStoragePort;
    private final FileValidator fileValidator;
    private final ApplicationEventPublisher eventPublisher;

    private static @NonNull String getLogicalPath(FileUploadCommand command) {
        String cleanDir = command.targetDirectory().endsWith("/")
                ? command.targetDirectory().substring(0, command.targetDirectory().length() - 1)
                : command.targetDirectory();

        // If cleanDir is empty (root), logical path is just fileName (with leading slash maybe? Adapter expects relative to root?)
        // Adapter logic: resolveTarget resolves relative to root.
        // If I pass "docs/file.txt", it resolves root/docs/file.txt.
        // If command.targetDirectory is "/docs", cleanDir is "/docs".
        // Path = "/docs/file.txt".
        // Adapter handles leading slash stripping.

        return cleanDir + "/" + command.fileName();
    }

    @Override
    public void upload(FileUploadCommand command) {
        log.debug("Processing upload request for file: {} in {}", command.fileName(),
                command.targetDirectory());

        // 1. Domain Validation
        fileValidator.validate(command.fileName(), command.size());

        // 2. Check available disk space (with 10% buffer for safety)
        long availableSpace = fileStoragePort.getAvailableDiskSpace();
        long requiredSpace = (long) (command.size() * 1.1); // 10% buffer
        if (availableSpace < requiredSpace) {
            log.warn("Insufficient disk space. Required: {} bytes, Available: {} bytes",
                    requiredSpace, availableSpace);
            throw new IllegalStateException("Insufficient disk space for upload");
        }

        // 3. Resolve Logical Path (targetDir + / + fileName)
        // Ensure targetDirectory doesn't have trailing slash, fileName doesn't have leading slash
        String logicalPath = getLogicalPath(command);

        // 4. Persist
        fileStoragePort.save(command.content(), logicalPath, command.size(), command.userId());

        // 5. Publish Event (Audit)
        eventPublisher.publishEvent(new FileUploadedEvent(
                command.userId(),
                logicalPath,
                command.size(),
                Instant.now()
        ));

        log.info("File uploaded successfully: {}", logicalPath);
    }

}
