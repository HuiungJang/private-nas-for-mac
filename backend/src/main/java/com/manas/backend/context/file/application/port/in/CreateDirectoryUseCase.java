package com.manas.backend.context.file.application.port.in;

import java.util.UUID;

public interface CreateDirectoryUseCase {
    void createDirectory(String parentPath, String name, UUID userId);
}
