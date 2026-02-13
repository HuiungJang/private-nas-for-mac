package com.manas.backend.context.file.infrastructure.web;

import com.manas.backend.common.security.ClientIpResolver;
import com.manas.backend.context.auth.infrastructure.security.AuthenticatedUserAccessor;
import com.manas.backend.context.auth.infrastructure.security.AuthenticatedUserPrincipal;
import com.manas.backend.context.file.application.port.in.DownloadFileUseCase;
import com.manas.backend.context.file.application.port.in.FileUploadCommand;
import com.manas.backend.context.file.application.port.in.FileUploadUseCase;
import com.manas.backend.context.file.application.port.in.GetFilePreviewUseCase;
import com.manas.backend.context.file.application.port.in.GetUploadStatusUseCase;
import com.manas.backend.context.file.application.port.in.UploadStatusResult;
import com.manas.backend.context.file.domain.FileContent;
import com.manas.backend.context.file.infrastructure.web.dto.UploadStatusResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileUploadUseCase fileUploadUseCase;
    private final DownloadFileUseCase downloadFileUseCase;
    private final GetFilePreviewUseCase getFilePreviewUseCase;
    private final GetUploadStatusUseCase getUploadStatusUseCase;
    private final ClientIpResolver clientIpResolver;
    private final AuthenticatedUserAccessor authenticatedUserAccessor;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "directory", defaultValue = "/") String directory,
            @RequestParam(value = "checksumSha256", required = false) String checksumSha256,
            @AuthenticationPrincipal AuthenticatedUserPrincipal user
    ) throws IOException {

        var userId = authenticatedUserAccessor.requiredUserId(user);

        FileUploadCommand command = new FileUploadCommand(
                file.getInputStream(),
                file.getOriginalFilename(),
                directory,
                file.getSize(),
                userId,
                checksumSha256
        );

        fileUploadUseCase.upload(command);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/upload/status")
    public ResponseEntity<UploadStatusResponse> getUploadStatus(
            @RequestParam("path") String path
    ) {
        UploadStatusResult result = getUploadStatusUseCase.getStatus(path);
        return ResponseEntity.ok(new UploadStatusResponse(result.exists(), result.size()));
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> downloadFile(
            @RequestParam("path") String path,
            @AuthenticationPrincipal AuthenticatedUserPrincipal user,
            HttpServletRequest request
    ) {
        var userId = authenticatedUserAccessor.requiredUserId(user);

        String clientIp = clientIpResolver.resolve(request);

        FileContent content = downloadFileUseCase.download(path, userId, clientIp);

        InputStreamResource resource = new InputStreamResource(content.inputStream());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + content.fileName() + "\"")
                .header(HttpHeaders.CONTENT_TYPE, content.contentType())
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(content.size()))
                .body(resource);
    }

    @GetMapping("/preview")
    public ResponseEntity<Resource> getPreview(
            @RequestParam("path") String path,
            @AuthenticationPrincipal AuthenticatedUserPrincipal user
    ) {
        var userId = authenticatedUserAccessor.requiredUserId(user);

        FileContent content = getFilePreviewUseCase.getPreview(path, userId);

        InputStreamResource resource = new InputStreamResource(content.inputStream());

        // Cache previews for 1 hour in browser
        CacheControl cacheControl = CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic();

        return ResponseEntity.ok()
                .cacheControl(cacheControl)
                .contentType(MediaType.parseMediaType(content.contentType()))
                .body(resource);
    }

}

