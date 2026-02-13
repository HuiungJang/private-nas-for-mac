package com.manas.backend.context.file.infrastructure.web.dto;

import java.util.List;

public record DeleteFilesResponse(
        List<String> deleted,
        List<DeleteFailureDto> failed
) {
    public record DeleteFailureDto(String path, String reason) {}
}
