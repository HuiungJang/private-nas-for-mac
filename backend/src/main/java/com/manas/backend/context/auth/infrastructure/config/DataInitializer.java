package com.manas.backend.context.auth.infrastructure.config;

import com.manas.backend.context.auth.domain.Role;
import com.manas.backend.context.auth.infrastructure.persistence.entity.UserEntity;
import com.manas.backend.context.auth.infrastructure.persistence.repository.JpaUserRepository;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;

@Slf4j
@Configuration
@RequiredArgsConstructor
@Profile("!test") // Don't run this in tests
public class DataInitializer {

    private final JpaUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    public void init() {
        if (userRepository.count() == 0) {
            log.info("No users found. Creating default admin user.");
            String encodedPassword = passwordEncoder.encode("admin123");
            UserEntity admin = new UserEntity(
                    null,
                    "admin",
                    encodedPassword,
                    Set.of(Role.ADMIN)
            );
            userRepository.save(admin);
            log.info("Default admin user created: admin / admin123");
        }
    }

}
