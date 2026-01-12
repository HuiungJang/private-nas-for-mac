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

    /**
     * Deletes a file or directory at the specified path.
     * @param path Absolute path or relative to root.
     * @param userId Optional user ID for logging/permission check.
     * @throws SecurityException if path is outside allowed scope.
     * @throws IllegalArgumentException if path does not exist.
     */
    void delete(String path, UUID userId);

    /**
     * Moves a file or directory from source to destination.
     *
     * @param sourcePath      Source path.
     * @param destinationPath Destination path.
     * @param userId          Optional user ID.
     */
    void move(String sourcePath, String destinationPath, UUID userId);

    /**
     * Saves content to the specified path.
     *
     * @param content InputStream of the file content.
     * @param path    Logical path where the file should be saved.
     * @param size    Size of the file in bytes.
     * @param userId  User ID performing the upload.
     * @throws SecurityException        if path is outside allowed scope.
     * @throws IllegalArgumentException if destination already exists or path is invalid.
     */
    void save(java.io.InputStream content, String path, long size, UUID userId);
}
