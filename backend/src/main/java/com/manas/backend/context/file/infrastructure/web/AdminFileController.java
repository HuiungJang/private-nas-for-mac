package com.manas.backend.context.file.infrastructure.web;

import com.manas.backend.context.auth.infrastructure.security.AuthenticatedUserAccessor;
import com.manas.backend.context.auth.infrastructure.security.AuthenticatedUserPrincipal;
import com.manas.backend.context.file.application.port.in.CreateDirectoryUseCase;
import com.manas.backend.context.file.application.port.in.DeleteFilesResult;
import com.manas.backend.context.file.application.port.in.DeleteFilesUseCase;
import com.manas.backend.context.file.application.port.in.FileListSort;
import com.manas.backend.context.file.application.port.in.ListDirectoryQuery;
import com.manas.backend.context.file.application.port.in.ListDirectoryUseCase;
import com.manas.backend.context.file.application.port.in.MoveFileUseCase;
import com.manas.backend.context.file.domain.DirectoryListing;
import com.manas.backend.context.file.infrastructure.web.dto.CreateDirectoryRequest;
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
    private final CreateDirectoryUseCase createDirectoryUseCase;
    private final FileMapper fileMapper;
    private final AuthenticatedUserAccessor authenticatedUserAccessor;

    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DirectoryListingDTO> listFiles(
            @RequestParam(required = false) String path,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(defaultValue = "NAME_ASC") FileListSort sort,
            @AuthenticationPrincipal AuthenticatedUserPrincipal user
    ) {
        var userId = authenticatedUserAccessor.requiredUserId(user);

        DirectoryListing result = listDirectoryUseCase.listDirectory(
                new ListDirectoryQuery(path, userId, offset, limit, sort)
        );
        return ResponseEntity.ok(fileMapper.toDTO(result));
    }

    @PostMapping("/delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DeleteFilesResponse> deleteFiles(
            @RequestBody DeleteFilesRequest request,
            @AuthenticationPrincipal AuthenticatedUserPrincipal user
    ) {
        var userId = authenticatedUserAccessor.requiredUserId(user);

        DeleteFilesResult result = deleteFilesUseCase.deleteFiles(request.paths(), userId);
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
        var userId = authenticatedUserAccessor.requiredUserId(user);
        moveFileUseCase.moveFile(request.sourcePath(), request.destinationPath(), userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/create-directory")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> createDirectory(
            @RequestBody CreateDirectoryRequest request,
            @AuthenticationPrincipal AuthenticatedUserPrincipal user
    ) {
        var userId = authenticatedUserAccessor.requiredUserId(user);
        createDirectoryUseCase.createDirectory(request.parentPath(), request.name(), userId);
        return ResponseEntity.noContent().build();
    }
}
