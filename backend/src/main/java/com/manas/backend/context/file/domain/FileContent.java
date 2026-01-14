package com.manas.backend.context.file.domain;

import java.io.InputStream;

/**
 * Domain object representing the content and metadata of a file. Used for file retrieval operations.
 */
public record FileContent(
        String fileName,
        String contentType,
        long size,
        InputStream inputStream
) {

}
