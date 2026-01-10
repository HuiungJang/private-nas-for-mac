package com.manas.backend.context.file.infrastructure.web.mapper;

import com.manas.backend.context.file.domain.DirectoryListing;
import com.manas.backend.context.file.domain.FileNode;
import com.manas.backend.context.file.domain.PathNode;
import com.manas.backend.context.file.infrastructure.web.dto.DirectoryListingDTO;
import com.manas.backend.context.file.infrastructure.web.dto.FileNodeDTO;
import com.manas.backend.context.file.infrastructure.web.dto.PathNodeDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FileMapper {

    DirectoryListingDTO toDTO(DirectoryListing domain);

    PathNodeDTO toDTO(PathNode domain);

    @Mapping(target = "type", expression = "java(domain.isDirectory() ? \"DIRECTORY\" : \"FILE\")")
    FileNodeDTO toDTO(FileNode domain);
}
