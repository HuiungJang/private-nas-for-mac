package com.manas.backend.context.file.infrastructure.fs;

import com.manas.backend.context.file.application.port.out.FileStoragePort;
import com.manas.backend.context.file.domain.DirectoryListing;
import com.manas.backend.context.file.domain.FileNode;
import com.manas.backend.context.file.domain.PathNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Slf4j
@Component
public class LocalFileSystemAdapter implements FileStoragePort {

    private final Path rootPath;

    public LocalFileSystemAdapter(@Value("${app.storage.root}") String rootPathString) {
        this.rootPath = Paths.get(rootPathString).toAbsolutePath().normalize();
    }

    @Override
    public DirectoryListing listDirectory(String pathString, UUID userId) {
        // 1. Validate & Resolve
        var targetPath = resolveAndValidate(pathString);

        // 2. Fetch & Sort
        var items = fetchFileNodes(targetPath);

        // 3. Generate Breadcrumbs
        var breadcrumbs = generateBreadcrumbs(targetPath);

        return new DirectoryListing(
                targetPath.toString(),
                breadcrumbs,
                items
        );
    }

    private Path resolveAndValidate(String pathString) {
        Path targetPath = (pathString == null || pathString.isBlank())
                ? rootPath
                : Paths.get(pathString).toAbsolutePath().normalize();

        if (!targetPath.startsWith(rootPath)) {
            log.warn("Security alert: Path traversal attempt to '{}'", targetPath);
            throw new SecurityException("Access denied: Path is outside the allowed storage root.");
        }

        if (!Files.exists(targetPath)) {
            throw new IllegalArgumentException("Path does not exist: " + targetPath);
        }

        if (!Files.isDirectory(targetPath)) {
            throw new IllegalArgumentException("Path is not a directory: " + targetPath);
        }

        return targetPath;
    }

    private List<FileNode> fetchFileNodes(Path directory) {
        try (Stream<Path> stream = Files.list(directory)) {
            return stream
                    .map(this::toFileNode)
                    .flatMap(Stream::ofNullable) // Filter out failed mappings (nulls)
                    .sorted(byTypeThenName())
                    .toList();
        } catch (IOException e) {
            log.error("Failed to list directory: {}", directory, e);
            throw new RuntimeException("Failed to list directory content", e);
        }
    }

    private FileNode toFileNode(Path path) {
        try {
            var attrs = Files.readAttributes(path, BasicFileAttributes.class);
            return new FileNode(
                    path.getFileName().toString(),
                    path.toAbsolutePath().toString(),
                    attrs.isDirectory(),
                    attrs.size(),
                    attrs.lastModifiedTime().toInstant(),
                    "system"
            );
        } catch (IOException e) {
            log.warn("Skipping file '{}' due to read error: {}", path, e.getMessage());
            return null;
        }
    }

    private Comparator<FileNode> byTypeThenName() {
        return Comparator.comparing(FileNode::isDirectory).reversed()
                .thenComparing(FileNode::name);
    }

    private List<PathNode> generateBreadcrumbs(Path targetPath) {
        var breadcrumbs = new ArrayList<PathNode>();
        var current = targetPath;

        // Walk up the tree until root
        while (current != null && current.startsWith(rootPath)) {
            String name = current.equals(rootPath) ? "Root" : current.getFileName().toString();
            breadcrumbs.add(new PathNode(name, current.toAbsolutePath().toString()));

            if (current.equals(rootPath)) break;
            current = current.getParent();
        }

        Collections.reverse(breadcrumbs);
        return breadcrumbs;
    }
}
