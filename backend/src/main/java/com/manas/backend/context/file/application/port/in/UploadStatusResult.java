package com.manas.backend.context.file.application.port.in;

public record UploadStatusResult(
        boolean exists,
        Long size
) {
}
