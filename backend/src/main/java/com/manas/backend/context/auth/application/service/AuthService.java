package com.manas.backend.context.auth.application.service;

import com.manas.backend.context.auth.application.port.in.LoginUseCase;
import com.manas.backend.context.auth.application.port.out.LoadUserPort;
import com.manas.backend.context.auth.application.port.out.PasswordEncoderPort;
import com.manas.backend.context.auth.application.port.out.TokenGeneratorPort;
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

    @Override
    public String login(String username, String password) {
        User user = loadUserPort.loadUserByUsername(username)
                .orElseThrow(() -> new SecurityException("Invalid credentials"));

        if (!passwordEncoderPort.matches(password, user.password().hash())) {
            throw new SecurityException("Invalid credentials");
        }

        return tokenGeneratorPort.generateToken(user);
    }

}
