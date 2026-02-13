package com.manas.backend.context.file.application.port.in;

import com.manas.backend.context.file.domain.DirectoryListing;

public interface ListDirectoryUseCase {
    DirectoryListing listDirectory(ListDirectoryQuery query);
}
