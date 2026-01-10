package com.manas.backend.context.auth.infrastructure.persistence;

import com.manas.backend.context.auth.application.port.out.LoadUserPort;
import com.manas.backend.context.auth.domain.User;
import com.manas.backend.context.auth.infrastructure.persistence.mapper.UserMapper;
import com.manas.backend.context.auth.infrastructure.persistence.repository.JpaUserRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary // Use this over InMemory adapter
@RequiredArgsConstructor
public class JpaUserRepositoryAdapter implements LoadUserPort {

    private final JpaUserRepository jpaUserRepository;
    private final UserMapper userMapper;

    @Override
    public Optional<User> loadUserByUsername(String username) {
        return jpaUserRepository.findByUsername(username)
                .map(userMapper::toDomain);
    }

}
