package com.manas.backend.context.file.infrastructure.web;

import com.manas.backend.context.file.application.port.in.ListDirectoryUseCase;
import com.manas.backend.context.file.domain.DirectoryListing;
import com.manas.backend.context.file.domain.FileNode;
import com.manas.backend.context.file.domain.PathNode;
import com.manas.backend.context.file.infrastructure.web.dto.DirectoryListingDTO;
import com.manas.backend.context.file.infrastructure.web.dto.FileNodeDTO;
import com.manas.backend.context.file.infrastructure.web.dto.PathNodeDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/files")
@RequiredArgsConstructor
public class AdminFileController {

    private final ListDirectoryUseCase listDirectoryUseCase;

    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DirectoryListingDTO> listFiles(
            @RequestParam(required = false) String path,
            @RequestParam(required = false) UUID userId
    ) {
        DirectoryListing result = listDirectoryUseCase.listDirectory(path, userId);
        return ResponseEntity.ok(mapToDTO(result));
    }

    // Manual mapping for now, replacing MapStruct as dependency is missing
    private DirectoryListingDTO mapToDTO(DirectoryListing domain) {
        List<PathNodeDTO> breadcrumbs = domain.breadcrumbs().stream()
                .map(this::mapPathNode)
                .toList();
        List<FileNodeDTO> items = domain.items().stream()
                .map(this::mapFileNode)
                .toList();

        return new DirectoryListingDTO(domain.currentPath(), breadcrumbs, items);
    }

    private PathNodeDTO mapPathNode(PathNode domain) {
        return new PathNodeDTO(domain.name(), domain.path());
    }

    private FileNodeDTO mapFileNode(FileNode domain) {
        return new FileNodeDTO(
                domain.name(),
                domain.isDirectory() ? "DIRECTORY" : "FILE",
                domain.size(),
                domain.lastModified(),
                domain.owner()
        );
    }
}
