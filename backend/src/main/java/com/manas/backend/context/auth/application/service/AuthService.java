package com.manas.backend.context.auth.application.service;

import com.manas.backend.context.auth.application.port.in.LoginResult;
import com.manas.backend.context.auth.application.port.in.LoginUseCase;
import com.manas.backend.context.auth.application.port.out.LoadUserPort;
import com.manas.backend.context.auth.application.port.out.PasswordEncoderPort;
import com.manas.backend.context.auth.application.port.out.SaveUserPort;
import com.manas.backend.context.auth.application.port.out.TokenGeneratorPort;
import com.manas.backend.context.auth.domain.Password;
import com.manas.backend.context.auth.domain.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService implements LoginUseCase {

    private final LoadUserPort loadUserPort;
    private final PasswordEncoderPort passwordEncoderPort;
    private final TokenGeneratorPort tokenGeneratorPort;
    private final SaveUserPort saveUserPort;

    @Override
    public LoginResult login(String username, String password) {
        User user = loadUserPort.loadUserByUsername(username)
                .orElseThrow(() -> new SecurityException("Invalid credentials"));

        if (!passwordEncoderPort.matches(password, user.password().hash())) {
            throw new SecurityException("Invalid credentials");
        }

        String token = tokenGeneratorPort.generateToken(user);
        return new LoginResult(token, user.mustChangePassword());
    }

    @Override
    public void changePassword(String username, String currentPassword, String newPassword) {
        User user = loadUserPort.loadUserByUsername(username)
                .orElseThrow(() -> new SecurityException("Invalid credentials"));

        if (!passwordEncoderPort.matches(currentPassword, user.password().hash())) {
            throw new SecurityException("Current password is incorrect");
        }

        validateNewPassword(newPassword, currentPassword);

        String encoded = passwordEncoderPort.encode(newPassword);
        User updated = new User(
                user.id(),
                user.username(),
                Password.of(encoded),
                user.roles(),
                user.active(),
                false
        );

        saveUserPort.save(updated);
    }

    private void validateNewPassword(String newPassword, String currentPassword) {
        if (newPassword == null || newPassword.length() < 10) {
            throw new IllegalArgumentException("New password must be at least 10 characters long");
        }

        if (newPassword.equals(currentPassword)) {
            throw new IllegalArgumentException("New password must be different from current password");
        }

        boolean hasUpper = newPassword.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = newPassword.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = newPassword.chars().anyMatch(Character::isDigit);

        if (!(hasUpper && hasLower && hasDigit)) {
            throw new IllegalArgumentException(
                    "New password must include uppercase, lowercase, and numeric characters");
        }
    }

}
