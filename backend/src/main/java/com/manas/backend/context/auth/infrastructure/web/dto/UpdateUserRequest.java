package com.manas.backend.context.auth.infrastructure.web.dto;

import com.manas.backend.context.auth.domain.Role;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.Set;

public record UpdateUserRequest(
        @NotNull(message = "Active status is required")
        Boolean active,

        @NotEmpty(message = "At least one role is required")
        Set<Role> roles
) {

}
