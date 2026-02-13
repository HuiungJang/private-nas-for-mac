package com.manas.backend.context.file.application.port.in;

import java.util.UUID;

public record ListDirectoryQuery(
        String path,
        UUID userId,
        int offset,
        int limit,
        FileListSort sort
) {
}
