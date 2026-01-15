package com.manas.backend.context.file.domain;

import java.util.Set;
import org.springframework.stereotype.Service;

/**
 * Domain Service for validating file properties. Enforces business rules regarding filenames, sizes, and
 * extensions.
 */
@Service
public class FileValidator {

    private static final Set<String> INVALID_CHARS = Set.of("..", "/", "\\");
    private static final long MAX_FILE_SIZE = 10L * 1024 * 1024 * 1024; // 10GB per spec
    private static final int MAX_FILENAME_LENGTH = 255;

    public void validate(String fileName, long size) {
        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("Filename cannot be empty");
        }

        // Check filename length (filesystem limit)
        if (fileName.length() > MAX_FILENAME_LENGTH) {
            throw new IllegalArgumentException(
                    "Filename exceeds maximum length of " + MAX_FILENAME_LENGTH + " characters");
        }

        // Check for path traversal characters
        for (String invalid : INVALID_CHARS) {
            if (fileName.contains(invalid)) {
                throw new IllegalArgumentException("Filename contains invalid characters: " + invalid);
            }
        }

        // Check for control characters (0x00-0x1F) which can cause filesystem issues
        for (int i = 0; i < fileName.length(); i++) {
            char c = fileName.charAt(i);
            if (c < 0x20) {
                throw new IllegalArgumentException(
                        "Filename contains invalid control character at position " + i);
            }
        }

        if (size <= 0) {
            throw new IllegalArgumentException("File size must be positive");
        }

        if (size > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 10GB");
        }
    }

}
