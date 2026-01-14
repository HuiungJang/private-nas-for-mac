package com.manas.backend.context.file.infrastructure.web;

import com.manas.backend.context.auth.domain.User;
import com.manas.backend.context.file.application.port.in.DownloadFileUseCase;
import com.manas.backend.context.file.application.port.in.FileUploadCommand;
import com.manas.backend.context.file.application.port.in.FileUploadUseCase;
import com.manas.backend.context.file.application.port.in.GetFilePreviewUseCase;
import com.manas.backend.context.file.domain.FileContent;
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

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "directory", defaultValue = "/") String directory,
            @AuthenticationPrincipal User user
    ) throws IOException {

        // We use the InputStream directly to stream content
        FileUploadCommand command = new FileUploadCommand(
                file.getInputStream(),
                file.getOriginalFilename(),
                directory,
                file.getSize(),
                user != null ? user.id()
                        : null // Handle potential null user in non-secured env (though tests might mock it)
        );

        fileUploadUseCase.upload(command);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/download")
    public ResponseEntity<Resource> downloadFile(
            @RequestParam("path") String path,
            @AuthenticationPrincipal User user,
            HttpServletRequest request
    ) {
        // Capture Client IP for Audit Log
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = request.getRemoteAddr();
        }

        FileContent content = downloadFileUseCase.download(path, user.id(), clientIp);

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
            @AuthenticationPrincipal User user
    ) {
        FileContent content = getFilePreviewUseCase.getPreview(path, user.id());

        InputStreamResource resource = new InputStreamResource(content.inputStream());

        // Cache previews for 1 hour in browser
        CacheControl cacheControl = CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic();

        return ResponseEntity.ok()
                .cacheControl(cacheControl)
                .contentType(MediaType.parseMediaType(content.contentType()))
                .body(resource);
    }

}

