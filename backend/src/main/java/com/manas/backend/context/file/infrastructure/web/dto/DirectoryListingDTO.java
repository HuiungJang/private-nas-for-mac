package com.manas.backend.context.file.infrastructure.web.dto;

import java.util.List;

public record DirectoryListingDTO(
    String currentPath,
    List<PathNodeDTO> breadcrumbs,
    List<FileNodeDTO> items
) {}
