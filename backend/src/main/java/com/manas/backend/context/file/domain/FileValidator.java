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

    public void validate(String fileName, long size) {
        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("Filename cannot be empty");
        }

        for (String invalid : INVALID_CHARS) {
            if (fileName.contains(invalid)) {
                throw new IllegalArgumentException("Filename contains invalid characters: " + invalid);
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
