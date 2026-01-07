package com.manas.backend.context.file.infrastructure.web.dto;

import java.time.Instant;

public record FileNodeDTO(
    String name,
    String type, // "FILE" or "DIRECTORY"
    long size,
    Instant lastModified,
    String owner
) {}
