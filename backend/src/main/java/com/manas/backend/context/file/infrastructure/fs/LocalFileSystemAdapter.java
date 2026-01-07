package com.manas.backend.context.file.infrastructure.fs;

import com.manas.backend.context.file.application.port.out.FileStoragePort;
import com.manas.backend.context.file.domain.DirectoryListing;
import com.manas.backend.context.file.domain.FileNode;
import com.manas.backend.context.file.domain.PathNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Component
public class LocalFileSystemAdapter implements FileStoragePort {

    private final Path rootPath;

    public LocalFileSystemAdapter(@Value("${app.storage.root}") String rootPathString) {
        this.rootPath = Paths.get(rootPathString).toAbsolutePath().normalize();
    }

    @Override
    public DirectoryListing listDirectory(String pathString, UUID userId) {
        Path targetPath;
        if (pathString == null || pathString.isBlank()) {
            targetPath = rootPath;
        } else {
            targetPath = Paths.get(pathString).toAbsolutePath().normalize();
        }

        // Security Check: Path traversal prevention
        if (!targetPath.startsWith(rootPath)) {
            throw new SecurityException("Access denied: Path is outside the allowed storage root.");
        }

        if (!Files.exists(targetPath)) {
             throw new IllegalArgumentException("Path does not exist: " + targetPath);
        }

        if (!Files.isDirectory(targetPath)) {
            throw new IllegalArgumentException("Path is not a directory: " + targetPath);
        }

        List<FileNode> items = new ArrayList<>();
        try (Stream<Path> stream = Files.list(targetPath)) {
            stream.forEach(p -> {
                try {
                    BasicFileAttributes attrs = Files.readAttributes(p, BasicFileAttributes.class);
                    items.add(new FileNode(
                            p.getFileName().toString(),
                            p.toAbsolutePath().toString(),
                            attrs.isDirectory(),
                            attrs.size(),
                            attrs.lastModifiedTime().toInstant(),
                            "system" // Default owner for now
                    ));
                } catch (IOException e) {
                    // Log error and skip
                    e.printStackTrace();
                }
            });
        } catch (IOException e) {
            throw new RuntimeException("Failed to list directory", e);
        }

        // Sort: Directories first, then files
        items.sort(Comparator.comparing(FileNode::isDirectory).reversed()
                .thenComparing(FileNode::name));

        List<PathNode> breadcrumbs = buildBreadcrumbs(targetPath);

        return new DirectoryListing(
                targetPath.toString(),
                breadcrumbs,
                items
        );
    }

    private List<PathNode> buildBreadcrumbs(Path targetPath) {
        List<PathNode> breadcrumbs = new ArrayList<>();
        Path current = targetPath;
        
        // Walk up until rootPath
        while (current != null && current.startsWith(rootPath)) {
            String name = current.equals(rootPath) ? "Root" : current.getFileName().toString();
            breadcrumbs.add(new PathNode(name, current.toAbsolutePath().toString()));
            
            if (current.equals(rootPath)) {
                break;
            }
            current = current.getParent();
        }
        Collections.reverse(breadcrumbs);
        return breadcrumbs;
    }
}
