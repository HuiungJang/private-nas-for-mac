package com.manas.backend.context.file.application.port.in;

import com.manas.backend.context.file.domain.FileContent;
import java.util.UUID;

public interface GetFilePreviewUseCase {

    /**
     * Retrieves a preview/thumbnail for a file.
     *
     * @param path   Logical path to the file.
     * @param userId User requesting the preview.
     * @return FileContent of the preview.
     */
    FileContent getPreview(String path, UUID userId);

}
