package com.manas.backend.context.file.application.port.out;

import com.manas.backend.context.file.domain.FileContent;
import com.manas.backend.context.file.domain.PreviewType;

public interface PreviewGeneratorPort {

    /**
     * Generates a preview (thumbnail) for the given file content.
     *
     * @param source The source file content (must be an image).
     * @param type   The desired preview type (size).
     * @return The generated preview as FileContent, or null if generation fails/not supported.
     */
    FileContent generate(FileContent source, PreviewType type);

    /**
     * Checks if the file type is supported for preview generation.
     *
     * @param contentType MIME type of the file.
     * @return true if supported.
     */
    boolean supports(String contentType);

}
