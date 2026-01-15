package com.manas.backend.context.auth.application.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.manas.backend.context.auth.application.port.out.LoadUsersPort;
import com.manas.backend.context.auth.domain.Password;
import com.manas.backend.context.auth.domain.Role;
import com.manas.backend.context.auth.domain.User;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UserManagementServiceTest {

    @Mock
    private LoadUsersPort loadUsersPort;

    private UserManagementService userManagementService;

    @BeforeEach
    void setUp() {
        userManagementService = new UserManagementService(loadUsersPort);
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

}
