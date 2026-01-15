package com.manas.backend.context.auth.application.port.in;

import com.manas.backend.context.auth.domain.Role;
import java.util.Set;

public record CreateUserCommand(
        String username,
        String rawPassword,
        Set<Role> roles
) {

}
