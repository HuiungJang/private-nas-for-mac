package com.manas.backend.context.file.application.port.in;

import java.util.List;

public record DeleteFilesResult(
        List<String> deleted,
        List<DeleteFailure> failed
) {
    public record DeleteFailure(String path, String reason) {}
}
