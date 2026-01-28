package com.manas.backend.context.file.infrastructure.fs;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.manas.backend.common.exception.ResourceNotFoundException;
import com.manas.backend.context.file.domain.FileContent;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class LocalFileSystemAdapterTest {

    @TempDir
    Path tempDir;

    private LocalFileSystemAdapter adapter;
    private UUID userId;

    @BeforeEach
    void setUp() {
        adapter = new LocalFileSystemAdapter(tempDir.toString());
        userId = UUID.randomUUID();
    }

    @AfterEach
    void tearDown() throws IOException {
        // Clean up is mostly handled by @TempDir, but ensure stream closure if needed
    }

    @Test
    @DisplayName("Should retrieve existing file")
    void shouldRetrieveExistingFile() throws IOException {
        // Given
        String fileName = "test.txt";
        String content = "Hello World";
        Path file = tempDir.resolve(fileName);
        Files.writeString(file, content);

        // When
        FileContent result = adapter.retrieve("/" + fileName, userId);

        // Then
        assertNotNull(result);
        assertEquals(fileName, result.fileName());
        assertEquals(content.length(), result.size());
        assertEquals("text/plain", result.contentType());

        String resultContent = new String(result.inputStream().readAllBytes(), StandardCharsets.UTF_8);
        assertEquals(content, resultContent);
    }

    @Test
    @DisplayName("Should throw exception if file does not exist")
    void shouldThrowIfFileDoesNotExist() {
        assertThrows(ResourceNotFoundException.class, () ->
                adapter.retrieve("/non-existent.txt", userId)
        );
    }

    @Test
    @DisplayName("Should throw exception if path is a directory")
    void shouldThrowIfPathIsDirectory() throws IOException {
        // Given
        String dirName = "subdir";
        Files.createDirectory(tempDir.resolve(dirName));

        // When/Then
        assertThrows(IllegalArgumentException.class, () ->
                adapter.retrieve("/" + dirName, userId)
        );
    }

    @Test
    @DisplayName("Should prevent path traversal")
    void shouldPreventPathTraversal() {
        assertThrows(SecurityException.class, () ->
                adapter.retrieve("/../outside.txt", userId)
        );
    }

}
