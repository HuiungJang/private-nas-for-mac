package com.manas.backend.context.file.application.service;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.manas.backend.context.file.application.port.in.FileListSort;
import com.manas.backend.context.file.application.port.in.ListDirectoryQuery;
import com.manas.backend.context.file.application.port.out.FileStoragePort;
import com.manas.backend.context.file.domain.DirectoryListing;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ListDirectoryServiceTest {

    @Mock
    private FileStoragePort fileStoragePort;

    @InjectMocks
    private ListDirectoryService listDirectoryService;

    @Test
    void shouldNormalizeOffsetAndLimit() {
        UUID userId = UUID.randomUUID();
        DirectoryListing listing = new DirectoryListing("/", List.of(), List.of(), 0, 0, 1);

        when(fileStoragePort.listDirectory(eq("/"), eq(userId), eq(0), eq(500), eq(FileListSort.NAME_ASC)))
                .thenReturn(listing);

        listDirectoryService.listDirectory(new ListDirectoryQuery("/", userId, -10, 9999, FileListSort.NAME_ASC));

        verify(fileStoragePort).listDirectory("/", userId, 0, 500, FileListSort.NAME_ASC);
    }
}
