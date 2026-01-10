package com.manas.backend.context.file.application.port.in;

import java.util.UUID;

public interface MoveFileUseCase {

    void moveFile(String sourcePath, String destinationPath, UUID userId);

}
