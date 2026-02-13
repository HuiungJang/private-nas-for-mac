package com.manas.backend.context.auth.infrastructure.persistence;

import com.manas.backend.context.auth.application.port.out.LoadUserPort;
import com.manas.backend.context.auth.domain.Password;
import com.manas.backend.context.auth.domain.Role;
import com.manas.backend.context.auth.domain.User;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
@RequiredArgsConstructor
public class InMemoryUserRepositoryAdapter implements LoadUserPort {

    private final PasswordEncoder passwordEncoder;
    private final Map<String, User> users = new ConcurrentHashMap<>();
    @Value("${app.security.bootstrap-admin-password:${app.security.default-password:}}")
    private String defaultPassword;

    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        if (!StringUtils.hasText(defaultPassword)) {
            return;
        }

        String encodedPassword = passwordEncoder.encode(defaultPassword);
        User admin = User.createBootstrapAdmin("admin", Password.of(encodedPassword), Set.of(Role.ADMIN));
        users.put(admin.username(), admin);
    }

    @Override
    public Optional<User> loadUserByUsername(String username) {
        return Optional.ofNullable(users.get(username));
    }

    @Override
    public Optional<User> loadUserById(java.util.UUID id) {
        return users.values().stream()
                .filter(u -> u.id().equals(id))
                .findFirst();
    }
}
