package com.manas.backend.context.file.application.port.in;

import com.manas.backend.context.file.domain.FileContent;
import java.util.UUID;

public interface DownloadFileUseCase {

    FileContent download(String path, UUID userId, String clientIp);

}
