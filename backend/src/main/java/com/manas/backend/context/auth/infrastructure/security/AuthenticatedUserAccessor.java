package com.manas.backend.context.auth.infrastructure.security;

import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class AuthenticatedUserAccessor {

    public UUID requiredUserId(AuthenticatedUserPrincipal principal) {
        if (principal == null) {
            throw new SecurityException("Unauthenticated request");
        }
        return principal.id();
    }
}
