package com.manas.backend.context.auth.infrastructure.config;

import com.manas.backend.context.auth.domain.Role;
import com.manas.backend.context.auth.infrastructure.persistence.entity.UserEntity;
import com.manas.backend.context.auth.infrastructure.persistence.repository.JpaUserRepository;
import java.util.Set;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.util.StringUtils;

@Slf4j
@Configuration
@RequiredArgsConstructor
@Profile("!test") // Don't run this in tests
public class DataInitializer {

    private final JpaUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.security.bootstrap-admin-password:}")
    private String bootstrapAdminPassword;

    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        if (userRepository.count() == 0) {
            if (!StringUtils.hasText(bootstrapAdminPassword)) {
                throw new IllegalStateException("Missing required property: app.security.bootstrap-admin-password");
            }

            log.info("No users found. Creating bootstrap admin user.");
            String encodedPassword = passwordEncoder.encode(bootstrapAdminPassword);
            UserEntity admin = new UserEntity(
                    UUID.randomUUID(),
                    "admin",
                    encodedPassword,
                    Set.of(Role.ADMIN),
                    true
            );
            userRepository.save(admin);
            log.info("Bootstrap admin user created. Please rotate credentials immediately.");
        }
    }

}
