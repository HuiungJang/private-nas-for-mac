package com.manas.backend.context.file.application.port.in;

import java.io.InputStream;
import java.util.UUID;

/**
 * Command to upload a file.
 *
 * @param content         InputStream of the file content.
 * @param fileName        Original filename.
 * @param targetDirectory Target logical directory path (e.g., "/documents").
 * @param size            Size of the file in bytes.
 * @param userId          User ID performing the upload.
 */
public record FileUploadCommand(
        InputStream content,
        String fileName,
        String targetDirectory,
        long size,
        UUID userId
) {

}
