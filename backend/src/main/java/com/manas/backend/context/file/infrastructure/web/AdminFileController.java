package com.manas.backend.context.file.infrastructure.web;

import com.manas.backend.context.auth.infrastructure.security.AuthenticatedUserPrincipal;
import com.manas.backend.context.file.application.port.in.DeleteFilesResult;
import com.manas.backend.context.file.application.port.in.DeleteFilesUseCase;
import com.manas.backend.context.file.application.port.in.FileListSort;
import com.manas.backend.context.file.application.port.in.ListDirectoryQuery;
import com.manas.backend.context.file.application.port.in.ListDirectoryUseCase;
import com.manas.backend.context.file.application.port.in.MoveFileUseCase;
import com.manas.backend.context.file.domain.DirectoryListing;
import com.manas.backend.context.file.infrastructure.web.dto.DeleteFilesRequest;
import com.manas.backend.context.file.infrastructure.web.dto.DeleteFilesResponse;
import com.manas.backend.context.file.infrastructure.web.dto.DirectoryListingDTO;
import com.manas.backend.context.file.infrastructure.web.dto.MoveFileRequest;
import com.manas.backend.context.file.infrastructure.web.mapper.FileMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/files")
@RequiredArgsConstructor
public class AdminFileController {

    private final ListDirectoryUseCase listDirectoryUseCase;
    private final DeleteFilesUseCase deleteFilesUseCase;
    private final MoveFileUseCase moveFileUseCase;
    private final FileMapper fileMapper;

    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DirectoryListingDTO> listFiles(
            @RequestParam(required = false) String path,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(defaultValue = "NAME_ASC") FileListSort sort,
            @AuthenticationPrincipal AuthenticatedUserPrincipal user
    ) {
        ensureAuthenticated(user);

        DirectoryListing result = listDirectoryUseCase.listDirectory(
                new ListDirectoryQuery(path, user.id(), offset, limit, sort)
        );
        return ResponseEntity.ok(fileMapper.toDTO(result));
    }

    @PostMapping("/delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DeleteFilesResponse> deleteFiles(
            @RequestBody DeleteFilesRequest request,
            @AuthenticationPrincipal AuthenticatedUserPrincipal user
    ) {
        ensureAuthenticated(user);

        DeleteFilesResult result = deleteFilesUseCase.deleteFiles(request.paths(), user.id());
        DeleteFilesResponse response = new DeleteFilesResponse(
                result.deleted(),
                result.failed().stream()
                        .map(f -> new DeleteFilesResponse.DeleteFailureDto(f.path(), f.reason()))
                        .toList()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/move")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> moveFile(
            @RequestBody MoveFileRequest request,
            @AuthenticationPrincipal AuthenticatedUserPrincipal user
    ) {
        ensureAuthenticated(user);
        moveFileUseCase.moveFile(request.sourcePath(), request.destinationPath(), user.id());
        return ResponseEntity.noContent().build();
    }

    private void ensureAuthenticated(AuthenticatedUserPrincipal user) {
        if (user == null) {
            throw new SecurityException("Unauthenticated request");
        }
    }
}
