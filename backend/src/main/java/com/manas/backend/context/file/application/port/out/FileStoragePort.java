package com.manas.backend.context.file.application.port.out;

import com.manas.backend.context.file.domain.DirectoryListing;
import java.util.UUID;

public interface FileStoragePort {
    /**
     * Lists files in the specified path.
     * @param path Absolute path or relative to root.
     * @param userId Optional user ID to root the view (if applicable).
     * @return DirectoryListing domain object.
     * @throws SecurityException if path is outside allowed scope.
     * @throws IllegalArgumentException if path is invalid.
     */
    DirectoryListing listDirectory(String path, UUID userId);
}
