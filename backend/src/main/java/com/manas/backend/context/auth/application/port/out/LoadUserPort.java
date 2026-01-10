package com.manas.backend.context.auth.application.port.out;

import com.manas.backend.context.auth.domain.User;
import java.util.Optional;

public interface LoadUserPort {

    Optional<User> loadUserByUsername(String username);

}
