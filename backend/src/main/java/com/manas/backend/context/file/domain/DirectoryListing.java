package com.manas.backend.context.file.domain;

import java.util.List;

public record DirectoryListing(
    String currentPath,
    List<PathNode> breadcrumbs,
    List<FileNode> items,
    int totalCount,
    int offset,
    int limit
) {}
