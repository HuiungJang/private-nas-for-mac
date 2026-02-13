package com.manas.backend.context.file.infrastructure.web.dto;

public record UploadStatusResponse(
        boolean exists,
        Long size
) {
}
