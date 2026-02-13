package com.manas.backend.context.auth.application.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;

import com.manas.backend.context.auth.application.port.out.LoadUserPort;
import com.manas.backend.context.auth.application.port.out.PasswordEncoderPort;
import com.manas.backend.context.auth.application.port.out.SaveUserPort;
import com.manas.backend.context.auth.application.port.out.TokenGeneratorPort;
import com.manas.backend.context.auth.domain.Password;
import com.manas.backend.context.auth.domain.Role;
import com.manas.backend.context.auth.domain.User;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private LoadUserPort loadUserPort;
    @Mock
    private PasswordEncoderPort passwordEncoderPort;
    @Mock
    private TokenGeneratorPort tokenGeneratorPort;
    @Mock
    private SaveUserPort saveUserPort;

    @InjectMocks
    private AuthService authService;

    @Test
    @DisplayName("Should return token when credentials are valid")
    void login_Success() {
        // Given
        String username = "admin";
        String rawPassword = "password";
        String encodedPassword = "encoded_password";
        String expectedToken = "jwt_token";

        User user = User.create(username, Password.of(encodedPassword), Set.of(Role.ADMIN));

        given(loadUserPort.loadUserByUsername(username)).willReturn(Optional.of(user));
        given(passwordEncoderPort.matches(rawPassword, encodedPassword)).willReturn(true);
        given(tokenGeneratorPort.generateToken(user)).willReturn(expectedToken);

        // When
        var result = authService.login(username, rawPassword);

        // Then
        assertThat(result.token()).isEqualTo(expectedToken);
        assertThat(result.mustChangePassword()).isFalse();
    }

    @Test
    @DisplayName("Should throw SecurityException when user not found")
    void login_UserNotFound() {
        // Given
        String username = "unknown";
        given(loadUserPort.loadUserByUsername(username)).willReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> authService.login(username, "pass"))
                .isInstanceOf(SecurityException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    @DisplayName("Should throw SecurityException when password does not match")
    void login_WrongPassword() {
        // Given
        String username = "admin";
        String rawPassword = "wrong_password";
        String encodedPassword = "encoded_password";

        User user = User.create(username, Password.of(encodedPassword), Set.of(Role.ADMIN));

        given(loadUserPort.loadUserByUsername(username)).willReturn(Optional.of(user));
        given(passwordEncoderPort.matches(rawPassword, encodedPassword)).willReturn(false);

        // When & Then
        assertThatThrownBy(() -> authService.login(username, rawPassword))
                .isInstanceOf(SecurityException.class)
                .hasMessage("Invalid credentials");
    }

    @Test
    @DisplayName("Should change password and clear mustChangePassword flag")
    void changePassword_Success() {
        String username = "admin";
        String currentPassword = "Current123";
        String newPassword = "NewPassword1";
        String encodedPassword = "encoded_password";

        User user = User.createBootstrapAdmin(username, Password.of(encodedPassword), Set.of(Role.ADMIN));

        given(loadUserPort.loadUserByUsername(username)).willReturn(Optional.of(user));
        given(passwordEncoderPort.matches(currentPassword, encodedPassword)).willReturn(true);
        given(passwordEncoderPort.encode(newPassword)).willReturn("new_encoded_password");

        authService.changePassword(username, currentPassword, newPassword);

        verify(saveUserPort).save(org.mockito.ArgumentMatchers.argThat(updated ->
                !updated.mustChangePassword() &&
                        updated.username().equals(username) &&
                        updated.password().hash().equals("new_encoded_password")
        ));
    }

    @Test
    @DisplayName("Should reject weak new password")
    void changePassword_WeakPassword() {
        String username = "admin";
        String currentPassword = "Current123";
        String encodedPassword = "encoded_password";

        User user = User.createBootstrapAdmin(username, Password.of(encodedPassword), Set.of(Role.ADMIN));

        given(loadUserPort.loadUserByUsername(username)).willReturn(Optional.of(user));
        given(passwordEncoderPort.matches(currentPassword, encodedPassword)).willReturn(true);

        assertThatThrownBy(() -> authService.changePassword(username, currentPassword, "short"))
                .isInstanceOf(IllegalArgumentException.class);

        verify(saveUserPort, never()).save(org.mockito.ArgumentMatchers.any());
    }

}
