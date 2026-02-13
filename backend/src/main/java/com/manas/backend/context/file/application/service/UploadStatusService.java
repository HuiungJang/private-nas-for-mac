package com.manas.backend.context.file.application.service;

import com.manas.backend.context.file.application.port.in.GetUploadStatusUseCase;
import com.manas.backend.context.file.application.port.in.UploadStatusResult;
import com.manas.backend.context.file.application.port.out.FileStoragePort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UploadStatusService implements GetUploadStatusUseCase {

    private final FileStoragePort fileStoragePort;

    @Override
    public UploadStatusResult getStatus(String path) {
        boolean exists = fileStoragePort.exists(path, null);
        if (!exists) {
            return new UploadStatusResult(false, null);
        }

        long size = fileStoragePort.getFileSize(path, null);
        return new UploadStatusResult(true, size);
    }
}
