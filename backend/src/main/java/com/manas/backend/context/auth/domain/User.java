package com.manas.backend.context.auth.domain;

import java.util.Set;
import java.util.UUID;

public record User(UUID id, String username, Password password, Set<Role> roles, boolean active) {

    public static User create(String username, Password password, Set<Role> roles) {
        return new User(UUID.randomUUID(), username, password, roles, true);
    }

    // Reconstruct from persistence
    public static User restore(UUID id, String username, String passwordHash, Set<Role> roles,
            boolean active) {
        return new User(id, username, Password.of(passwordHash), roles, active);
    }
}
