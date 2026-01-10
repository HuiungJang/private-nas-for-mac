package com.manas.backend.context.file.infrastructure.web.dto;

import java.util.List;

public record DeleteFilesRequest(List<String> paths) {

}
