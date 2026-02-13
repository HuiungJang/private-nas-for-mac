package com.manas.backend.context.file.application.service;

import com.manas.backend.context.file.application.port.in.ListDirectoryQuery;
import com.manas.backend.context.file.application.port.in.ListDirectoryUseCase;
import com.manas.backend.context.file.application.port.out.FileStoragePort;
import com.manas.backend.context.file.domain.DirectoryListing;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ListDirectoryService implements ListDirectoryUseCase {

    private final FileStoragePort fileStoragePort;

    @Override
    public DirectoryListing listDirectory(ListDirectoryQuery query) {
        int normalizedOffset = Math.max(0, query.offset());
        int normalizedLimit = Math.min(Math.max(1, query.limit()), 500);

        return fileStoragePort.listDirectory(
                query.path(),
                query.userId(),
                normalizedOffset,
                normalizedLimit,
                query.sort()
        );
    }
}
