package com.manas.backend.context.file.domain;

import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;

class FileValidatorTest {

    private final FileValidator validator = new FileValidator();

    @Test
    void validate_ShouldPass_WhenFileIsValid() {
        validator.validate("document.pdf", 1024);
    }

    @Test
    void validate_ShouldThrow_WhenFilenameIsEmpty() {
        assertThrows(IllegalArgumentException.class, () -> validator.validate("", 1024));
        assertThrows(IllegalArgumentException.class, () -> validator.validate(null, 1024));
    }

    @Test
    void validate_ShouldThrow_WhenFilenameContainsPathTraversal() {
        assertThrows(IllegalArgumentException.class, () -> validator.validate("../secret", 1024));
        assertThrows(IllegalArgumentException.class, () -> validator.validate("dir/file", 1024));
    }

    @Test
    void validate_ShouldThrow_WhenSizeIsInvalid() {
        assertThrows(IllegalArgumentException.class, () -> validator.validate("file.txt", 0));
        assertThrows(IllegalArgumentException.class, () -> validator.validate("file.txt", -1));
    }

    @Test
    void validate_ShouldThrow_WhenSizeExceedsLimit() {
        long tooBig = (10L * 1024 * 1024 * 1024) + 1;
        assertThrows(IllegalArgumentException.class, () -> validator.validate("huge.iso", tooBig));
    }

}
