package com.manas.backend.context.file.infrastructure.fs;

import com.manas.backend.context.file.domain.DirectoryListing;
import com.manas.backend.context.file.domain.FileNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

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
        assertEquals(tempDir.toAbsolutePath().normalize().toString(), listing.currentPath());
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
            adapter.listDirectory("/etc", null);
        });
    }

    @Test
    void listDirectory_ShouldReturnSubdirectory_WhenPathIsValid() throws IOException {
        // Arrange
        Path subDir = tempDir.resolve("subdir");
        Files.createDirectory(subDir);
        Files.createFile(subDir.resolve("subfile.txt"));

        // Act
        DirectoryListing listing = adapter.listDirectory(subDir.toString(), null);

        // Assert
        assertEquals(subDir.toAbsolutePath().normalize().toString(), listing.currentPath());
        assertEquals(1, listing.items().size());
        assertEquals("subfile.txt", listing.items().get(0).name());
        
        // Breadcrumbs: Root -> subdir
        assertEquals(2, listing.breadcrumbs().size());
        assertEquals("Root", listing.breadcrumbs().get(0).name());
        assertEquals("subdir", listing.breadcrumbs().get(1).name());
    }
}
