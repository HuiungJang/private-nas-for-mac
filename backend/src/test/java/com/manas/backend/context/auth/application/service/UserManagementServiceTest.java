package com.manas.backend.context.auth.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.manas.backend.context.auth.application.port.in.CreateUserCommand;
import com.manas.backend.context.auth.application.port.in.UpdateUserCommand;
import com.manas.backend.context.auth.application.port.out.CheckUserExistsPort;
import com.manas.backend.context.auth.application.port.out.LoadUserPort;
import com.manas.backend.context.auth.application.port.out.LoadUsersPort;
import com.manas.backend.context.auth.application.port.out.SaveUserPort;
import com.manas.backend.context.auth.domain.Password;
import com.manas.backend.context.auth.domain.Role;
import com.manas.backend.context.auth.domain.User;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class UserManagementServiceTest {

    @Mock
    private LoadUsersPort loadUsersPort;
    @Mock
    private LoadUserPort loadUserPort;
    @Mock
    private SaveUserPort saveUserPort;
    @Mock
    private CheckUserExistsPort checkUserExistsPort;
    @Mock
    private PasswordEncoder passwordEncoder;

    private UserManagementService userManagementService;

    @BeforeEach
    void setUp() {
        userManagementService = new UserManagementService(loadUsersPort, loadUserPort, saveUserPort,
                checkUserExistsPort, passwordEncoder);
    }

    @Test
    @DisplayName("Should return list of all users")
    void shouldListAllUsers() {
        // Given
        User admin = User.create("admin", Password.of("hash"), Set.of(Role.ADMIN));
        User user = User.create("user", Password.of("hash"), Set.of(Role.USER));

        when(loadUsersPort.findAll()).thenReturn(List.of(admin, user));

        // When
        List<User> result = userManagementService.listAllUsers();

        // Then
        assertNotNull(result);
        assertEquals(2, result.size());
        verify(loadUsersPort).findAll();
    }

    @Test
    @DisplayName("Should create user successfully")
    void shouldCreateUser() {
        // Given
        CreateUserCommand command = new CreateUserCommand("newuser", "rawpass", Set.of(Role.USER));

        when(checkUserExistsPort.existsByUsername("newuser")).thenReturn(false);
        when(passwordEncoder.encode("rawpass")).thenReturn("hashedpass");

        // When
        userManagementService.createUser(command);

        // Then
        verify(checkUserExistsPort).existsByUsername("newuser");
        verify(passwordEncoder).encode("rawpass");
        verify(saveUserPort).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception if user already exists")
    void shouldThrowIfUserExists() {
        // Given
        CreateUserCommand command = new CreateUserCommand("existing", "pass", Set.of(Role.USER));
        when(checkUserExistsPort.existsByUsername("existing")).thenReturn(true);

        // When/Then
        assertThrows(IllegalArgumentException.class, () -> userManagementService.createUser(command));

        verify(saveUserPort, org.mockito.Mockito.never()).save(any());
    }

    @Test
    @DisplayName("Should update user successfully")
    void shouldUpdateUser() {
        // Given
        UUID userId = UUID.randomUUID();
        User existingUser = User.create("user", Password.of("hash"), Set.of(Role.USER));
        // Mock ID since create generates random
        existingUser = new User(userId, existingUser.username(), existingUser.password(),
                existingUser.roles(), true, false);

        UpdateUserCommand command = new UpdateUserCommand(userId, false, Set.of(Role.ADMIN));

        when(loadUserPort.loadUserById(userId)).thenReturn(Optional.of(existingUser));

        // When
        userManagementService.updateUser(command);

        // Then
        verify(saveUserPort).save(argThat(u ->
                u.id().equals(userId) &&
                !u.active() &&
                u.roles().contains(Role.ADMIN)
        ));
    }

    @Test
    @DisplayName("Should throw exception if user to update not found")
    void shouldThrowIfUserNotFound() {
        // Given
        UUID userId = UUID.randomUUID();
        UpdateUserCommand command = new UpdateUserCommand(userId, true, Set.of(Role.USER));

        when(loadUserPort.loadUserById(userId)).thenReturn(Optional.empty());

        // When/Then
        assertThrows(IllegalArgumentException.class, () -> userManagementService.updateUser(command));
        verify(saveUserPort, org.mockito.Mockito.never()).save(any());
    }
}
