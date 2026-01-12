package com.manas.backend.context.system.infrastructure.event.listener;

import com.manas.backend.context.file.domain.event.FileUploadedEvent;
import com.manas.backend.context.system.application.port.in.RecordAuditLogUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class FileEventListener {

    private final RecordAuditLogUseCase recordAuditLogUseCase;

    @EventListener
    public void onFileUploaded(FileUploadedEvent event) {
        log.debug("Received FileUploadedEvent for user {}", event.userId());
        recordAuditLogUseCase.record(
                event.userId(),
                "FILE_UPLOAD",
                event.filePath(),
                "INTERNAL", // IP address might be hard to get here unless passed in event.
                "SUCCESS"
        );
    }

}
