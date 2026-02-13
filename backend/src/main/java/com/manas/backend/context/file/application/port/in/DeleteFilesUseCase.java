package com.manas.backend.context.file.application.port.in;

import java.util.List;
import java.util.UUID;

public interface DeleteFilesUseCase {

    DeleteFilesResult deleteFiles(List<String> paths, UUID userId);

}
