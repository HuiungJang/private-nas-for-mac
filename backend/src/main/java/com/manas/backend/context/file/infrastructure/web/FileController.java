package com.manas.backend.context.file.infrastructure.web;

import com.manas.backend.context.auth.domain.User;
import com.manas.backend.context.file.application.port.in.FileUploadCommand;
import com.manas.backend.context.file.application.port.in.FileUploadUseCase;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

}
