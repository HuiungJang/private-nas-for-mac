package com.manas.backend.context.auth.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.manas.backend.TestcontainersConfiguration;
import com.manas.backend.context.auth.domain.Password;
import com.manas.backend.context.auth.domain.Role;
import com.manas.backend.context.auth.domain.User;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
class JpaUserRepositoryAdapterIT {

    @Autowired
    private JpaUserRepositoryAdapter adapter;

    @Test
    @DisplayName("Should save and load user by ID")
    void shouldSaveAndLoadUserById() {
        // Given
        User user = User.create("integrationUser", Password.of("hash"), Set.of(Role.USER));

        // When
        adapter.save(user);
        Optional<User> loaded = adapter.loadUserById(user.id());

        // Then
        assertThat(loaded).isPresent();
        assertThat(loaded.get().id()).isEqualTo(user.id());
        assertThat(loaded.get().username()).isEqualTo("integrationUser");
        assertThat(loaded.get().active()).isTrue();
    }

    @Test
    @DisplayName("Should load user by username")
    void shouldLoadUserByUsername() {
        // Given
        User user = User.create("namedUser", Password.of("hash"), Set.of(Role.ADMIN));
        adapter.save(user);

        // When
        Optional<User> loaded = adapter.loadUserByUsername("namedUser");

        // Then
        assertThat(loaded).isPresent();
        assertThat(loaded.get().username()).isEqualTo("namedUser");
    }

}
