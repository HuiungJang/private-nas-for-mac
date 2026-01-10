package com.manas.backend.context.auth.infrastructure.adapter;

import com.manas.backend.context.auth.application.port.out.TokenGeneratorPort;
import com.manas.backend.context.auth.domain.User;
import com.manas.backend.context.auth.infrastructure.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TokenGeneratorAdapter implements TokenGeneratorPort {

    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public String generateToken(User user) {
        return jwtTokenProvider.generateToken(user.username());
    }

}
