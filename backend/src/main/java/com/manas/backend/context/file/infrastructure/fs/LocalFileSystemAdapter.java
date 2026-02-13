package com.manas.backend.context.file.infrastructure.fs;

import com.manas.backend.common.exception.FileOperationException;
import com.manas.backend.common.exception.ResourceNotFoundException;
import com.manas.backend.context.file.application.port.out.FileStoragePort;
import com.manas.backend.context.file.domain.DirectoryListing;
import com.manas.backend.context.file.domain.FileContent;
import com.manas.backend.context.file.domain.FileNode;
import com.manas.backend.context.file.domain.PathNode;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.FileStore;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class LocalFileSystemAdapter implements FileStoragePort {

    private final Path rootPath;

    public LocalFileSystemAdapter(@Value("${app.storage.root}") String rootPathString) {
        this.rootPath = Paths.get(rootPathString).toAbsolutePath().normalize();
    }

    @Override
    public void delete(String pathString, UUID userId) {
        Path targetPath = resolveTarget(pathString);

        if (!Files.exists(targetPath)) {
            throw new ResourceNotFoundException("Path does not exist: " + targetPath);
        }

        try {
            // TODO: Handle recursive delete if it's a directory?
            // For now, standard delete (will fail if non-empty dir)
            Files.delete(targetPath);
            log.info("User {} deleted file: {}", userId, targetPath);
        } catch (IOException e) {
            log.error("Failed to delete path: {}", targetPath, e);
            throw new FileOperationException("Failed to delete file: " + e.getMessage(), e);
        }
    }

    @Override
    public void move(String sourcePathString, String destinationPathString, UUID userId) {
        Path sourcePath = resolveTarget(sourcePathString);
        Path destinationPath = resolveTarget(destinationPathString);

        if (!Files.exists(sourcePath)) {
            throw new ResourceNotFoundException("Source path does not exist: " + sourcePath);
        }

        if (Files.exists(destinationPath)) {
            throw new IllegalArgumentException("Destination path already exists: " + destinationPath);
        }

        try {
            // Create parent directories if they don't exist
            Files.createDirectories(destinationPath.getParent());

            Files.move(sourcePath, destinationPath);
            log.info("User {} moved file from {} to {}", userId, sourcePath, destinationPath);
        } catch (IOException e) {
            log.error("Failed to move file from {} to {}", sourcePath, destinationPath, e);
            throw new FileOperationException("Failed to move file: " + e.getMessage(), e);
        }
    }

    @Override
    public void save(InputStream content, String pathString, long size, UUID userId) {
        Path targetPath = resolveTarget(pathString);

        if (Files.exists(targetPath)) {
            throw new IllegalArgumentException("File already exists: " + targetPath);
        }

        try {
            Files.createDirectories(targetPath.getParent());
            Files.copy(content, targetPath);
            log.info("User {} uploaded file: {} (Size: {})", userId, targetPath, size);
        } catch (IOException e) {
            log.error("Failed to upload file to: {}", targetPath, e);
            throw new FileOperationException("Failed to upload file", e);
        }
    }

    @Override
    public FileContent retrieve(String pathString, UUID userId) {
        Path targetPath = resolveTarget(pathString);

        if (!Files.exists(targetPath)) {
            throw new ResourceNotFoundException("File does not exist: " + targetPath);
        }

        if (Files.isDirectory(targetPath)) {
            throw new IllegalArgumentException("Path is a directory: " + targetPath);
        }

        try {
            String contentType = Files.probeContentType(targetPath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            long size = Files.size(targetPath);
            String fileName = targetPath.getFileName().toString();
            InputStream inputStream = Files.newInputStream(targetPath);

            log.info("User {} downloading file: {}", userId, targetPath);

            return new FileContent(fileName, contentType, size, inputStream);
        } catch (IOException e) {
            log.error("Failed to retrieve file: {}", targetPath, e);
            throw new FileOperationException("Failed to retrieve file content", e);
        }
    }

    @Override
    public DirectoryListing listDirectory(String pathString, UUID userId) {
        // 1. Validate & Resolve
        var targetPath = resolveAndValidate(pathString);

        // 2. Fetch & Sort
        var items = fetchFileNodes(targetPath);

        // 3. Generate Breadcrumbs
        var breadcrumbs = generateBreadcrumbs(targetPath);

        // Calculate logical path for response
        String logicalPath = toLogicalPath(targetPath);

        return new DirectoryListing(
                logicalPath,
                breadcrumbs,
                items
        );
    }

    private Path resolveTarget(String pathString) {
        if (pathString == null || pathString.isBlank()) {
            return rootPath;
        }

        // Treat all paths as relative to rootPath.
        // If pathString starts with "/", strip it to prevent Path.resolve() from treating it as absolute.
        String relativePath = pathString.startsWith("/") ? pathString.substring(1) : pathString;

        Path targetPath = rootPath.resolve(relativePath).toAbsolutePath().normalize();

        if (!targetPath.startsWith(rootPath)) {
            log.warn("Security alert: Path traversal attempt to '{}'", targetPath);
            throw new SecurityException("Access denied: Path is outside the allowed storage root.");
        }
        return targetPath;
    }

    private Path resolveAndValidate(String pathString) {
        Path targetPath = resolveTarget(pathString);

        if (!Files.exists(targetPath)) {
            throw new ResourceNotFoundException("Path does not exist: " + targetPath);
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
            throw new FileOperationException("Failed to list directory content", e);
        }
    }

    private FileNode toFileNode(Path path) {
        try {
            var attrs = Files.readAttributes(path, BasicFileAttributes.class);
            return new FileNode(
                    path.getFileName().toString(),
                    toLogicalPath(path),
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

    private String toLogicalPath(Path path) {
        if (path.equals(rootPath)) {
            return "/";
        }
        // Create path relative to root, formatted as /path/to/file
        return "/" + rootPath.relativize(path);
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
            breadcrumbs.add(new PathNode(name, toLogicalPath(current)));

            if (current.equals(rootPath)) break;
            current = current.getParent();
        }

        Collections.reverse(breadcrumbs);
        return breadcrumbs;
    }

    @Override
    public boolean exists(String pathString, UUID userId) {
        Path targetPath = resolveTarget(pathString);
        return Files.exists(targetPath);
    }

    @Override
    public long getFileSize(String pathString, UUID userId) {
        Path targetPath = resolveTarget(pathString);

        if (!Files.exists(targetPath)) {
            throw new ResourceNotFoundException("File does not exist: " + targetPath);
        }

        if (Files.isDirectory(targetPath)) {
            throw new IllegalArgumentException("Path is a directory: " + targetPath);
        }

        try {
            return Files.size(targetPath);
        } catch (IOException e) {
            log.error("Failed to get file size: {}", targetPath, e);
            throw new FileOperationException("Failed to get file size", e);
        }
    }

    @Override
    public long getAvailableDiskSpace() {
        try {
            FileStore fileStore = Files.getFileStore(rootPath);
            return fileStore.getUsableSpace();
        } catch (IOException e) {
            log.error("Failed to get available disk space for root path: {}", rootPath, e);
            throw new FileOperationException("Failed to check disk space", e);
        }
    }
}
