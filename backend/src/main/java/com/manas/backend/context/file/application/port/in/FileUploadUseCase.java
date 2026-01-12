package com.manas.backend.context.file.application.port.in;

public interface FileUploadUseCase {

    /**
     * Uploads a file to the system.
     *
     * @param command The upload command containing file details and content.
     */
    void upload(FileUploadCommand command);

}
