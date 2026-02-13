package com.manas.backend.context.file.application.port.in;

public interface GetUploadStatusUseCase {
    UploadStatusResult getStatus(String path);
}
