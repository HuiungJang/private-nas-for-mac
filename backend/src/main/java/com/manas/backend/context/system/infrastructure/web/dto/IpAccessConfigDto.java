package com.manas.backend.context.system.infrastructure.web.dto;

import java.util.List;

public record IpAccessConfigDto(
        List<String> allowedSubnets
) {

}
