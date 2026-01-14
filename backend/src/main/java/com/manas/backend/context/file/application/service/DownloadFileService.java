package com.manas.backend.context.file.application.service;

import com.manas.backend.context.file.application.port.in.DownloadFileUseCase;
import com.manas.backend.context.file.application.port.out.FileStoragePort;
import com.manas.backend.context.file.domain.FileContent;
import com.manas.backend.context.system.application.port.in.RecordAuditLogUseCase;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class DownloadFileService implements DownloadFileUseCase {

    private final FileStoragePort fileStoragePort;
    private final RecordAuditLogUseCase recordAuditLogUseCase;

    @Override
    public FileContent download(String path, UUID userId, String clientIp) {
        log.info("Request to download file: {} by user: {}", path, userId);

        // Retrieve file content from storage (validates existence and security)
        FileContent content = fileStoragePort.retrieve(path, userId);

        // Record Audit Log
        recordAuditLogUseCase.record(
                userId,
                "DOWNLOAD",
                path,
                clientIp,
                "SUCCESS"
        );

        return content;
    }

}
