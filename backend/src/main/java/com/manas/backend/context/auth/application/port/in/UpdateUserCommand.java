package com.manas.backend.context.auth.application.port.in;

import com.manas.backend.context.auth.domain.Role;
import java.util.Set;
import java.util.UUID;

public record UpdateUserCommand(
        UUID userId,
        boolean active,
        Set<Role> roles
) {

}
