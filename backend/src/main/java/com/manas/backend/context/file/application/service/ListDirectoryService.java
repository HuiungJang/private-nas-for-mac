package com.manas.backend.context.file.application.service;

import com.manas.backend.context.file.application.port.in.ListDirectoryUseCase;
import com.manas.backend.context.file.application.port.out.FileStoragePort;
import com.manas.backend.context.file.domain.DirectoryListing;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ListDirectoryService implements ListDirectoryUseCase {

    private final FileStoragePort fileStoragePort;

    @Override
    public DirectoryListing listDirectory(String path, UUID userId) {
        // Business logic could be added here (e.g. detailed logging, validation that isn't infra-specific)
        // For now, delegate to the port.
        return fileStoragePort.listDirectory(path, userId);
    }
}
