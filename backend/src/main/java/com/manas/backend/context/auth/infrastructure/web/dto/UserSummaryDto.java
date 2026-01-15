package com.manas.backend.context.auth.infrastructure.web.dto;

import com.manas.backend.context.auth.domain.Role;
import java.util.Set;
import java.util.UUID;

public record UserSummaryDto(
        UUID id,
        String username,
        Set<Role> roles
) {

}
