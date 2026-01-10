package com.manas.backend.context.auth.application.port.out;

import com.manas.backend.context.auth.domain.User;

public interface TokenGeneratorPort {

    String generateToken(User user);

}
