package com.manas.backend.context.file.domain;

import java.time.Instant;

public record FileNode(
    String name,
    String path,
    boolean isDirectory,
    long size,
    Instant lastModified,
    String owner // simplified for now, might be a User ID or name
) {}
