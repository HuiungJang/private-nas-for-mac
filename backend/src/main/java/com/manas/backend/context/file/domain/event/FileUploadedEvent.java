package com.manas.backend.context.file.domain.event;

import java.time.Instant;
import java.util.UUID;

public record FileUploadedEvent(
        UUID userId,
        String filePath,
        long size,
        Instant timestamp
) {

}
