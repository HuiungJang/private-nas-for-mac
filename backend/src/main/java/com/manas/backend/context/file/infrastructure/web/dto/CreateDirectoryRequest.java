package com.manas.backend.context.file.infrastructure.web.dto;

public record CreateDirectoryRequest(
        String parentPath,
        String name
) {
}
