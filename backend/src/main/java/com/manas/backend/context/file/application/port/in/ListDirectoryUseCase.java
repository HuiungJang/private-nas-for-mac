package com.manas.backend.context.file.application.port.in;

import com.manas.backend.context.file.domain.DirectoryListing;
import java.util.UUID;

public interface ListDirectoryUseCase {
    DirectoryListing listDirectory(String path, UUID userId);
}
