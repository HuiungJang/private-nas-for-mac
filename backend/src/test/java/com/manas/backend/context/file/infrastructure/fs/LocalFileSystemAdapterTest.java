package com.manas.backend.context.file.infrastructure.fs;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.manas.backend.context.file.domain.DirectoryListing;
import com.manas.backend.context.file.domain.FileNode;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class LocalFileSystemAdapterTest {

    @TempDir
    Path tempDir;

    private LocalFileSystemAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new LocalFileSystemAdapter(tempDir.toString());
    }

    @Test
    void listDirectory_ShouldReturnCorrectListing_WhenPathIsRoot() throws IOException {
        // Arrange
        Files.createFile(tempDir.resolve("file1.txt"));
        Files.createDirectory(tempDir.resolve("subdir"));

        // Act
        DirectoryListing listing = adapter.listDirectory(null, null);

        // Assert
        assertEquals("/", listing.currentPath());
        assertEquals(2, listing.items().size());

        FileNode dirNode = listing.items().stream()
                .filter(FileNode::isDirectory)
                .findFirst()
                .orElseThrow();
        assertEquals("subdir", dirNode.name());

        FileNode fileNode = listing.items().stream()
                .filter(n -> !n.isDirectory())
                .findFirst()
                .orElseThrow();
        assertEquals("file1.txt", fileNode.name());

        // Breadcrumbs should contain only Root
        assertEquals(1, listing.breadcrumbs().size());
        assertEquals("Root", listing.breadcrumbs().get(0).name());
    }

    @Test
    void listDirectory_ShouldThrowSecurityException_WhenPathIsOutsideRoot() {
        assertThrows(SecurityException.class, () -> {
            adapter.listDirectory("../outside", null);
        });
    }

    @Test
    void listDirectory_ShouldReturnSubdirectory_WhenPathIsValid() throws IOException {
        // Arrange
        Path subDir = tempDir.resolve("subdir");
        Files.createDirectory(subDir);
        Files.createFile(subDir.resolve("subfile.txt"));

        // Act
        // Must pass relative path, not absolute
        DirectoryListing listing = adapter.listDirectory("subdir", null);

        // Assert
        assertEquals("/subdir", listing.currentPath());
        assertEquals(1, listing.items().size());
        assertEquals("subfile.txt", listing.items().get(0).name());

        // Breadcrumbs: Root -> subdir
        assertEquals(2, listing.breadcrumbs().size());
        assertEquals("Root", listing.breadcrumbs().get(0).name());
        assertEquals("subdir", listing.breadcrumbs().get(1).name());
    }

    @Test
    void save_ShouldCreateFile_WhenPathIsValid() throws IOException {
        // Arrange
        String filename = "newfile.txt";
        String content = "Hello World";
        java.io.InputStream inputStream = new java.io.ByteArrayInputStream(content.getBytes());
        UUID userId = UUID.randomUUID();

        // Act
        adapter.save(inputStream, filename, content.length(), userId);

        // Assert
        Path savedPath = tempDir.resolve(filename);
        assertTrue(Files.exists(savedPath));
        assertEquals(content, Files.readString(savedPath));
    }

    @Test
    void save_ShouldThrowException_WhenFileAlreadyExists() throws IOException {
        // Arrange
        String filename = "existing.txt";
        Files.createFile(tempDir.resolve(filename));
        java.io.InputStream inputStream = new java.io.ByteArrayInputStream("content".getBytes());
        UUID userId = UUID.randomUUID();

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
                adapter.save(inputStream, filename, 7, userId)
        );
    }
}
