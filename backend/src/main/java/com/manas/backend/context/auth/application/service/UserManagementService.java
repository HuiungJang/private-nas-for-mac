package com.manas.backend.context.auth.application.service;

import com.manas.backend.context.auth.application.port.in.CreateUserCommand;
import com.manas.backend.context.auth.application.port.in.CreateUserUseCase;
import com.manas.backend.context.auth.application.port.in.ListUsersUseCase;
import com.manas.backend.context.auth.application.port.in.UpdateUserCommand;
import com.manas.backend.context.auth.application.port.in.UpdateUserUseCase;
import com.manas.backend.context.auth.application.port.out.CheckUserExistsPort;
import com.manas.backend.context.auth.application.port.out.LoadUserPort;
import com.manas.backend.context.auth.application.port.out.LoadUsersPort;
import com.manas.backend.context.auth.application.port.out.SaveUserPort;
import com.manas.backend.context.auth.domain.Password;
import com.manas.backend.context.auth.domain.User;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j

@Service

@RequiredArgsConstructor

public class UserManagementService implements ListUsersUseCase, CreateUserUseCase, UpdateUserUseCase {



    private final LoadUsersPort loadUsersPort;

    private final LoadUserPort loadUserPort;

    private final SaveUserPort saveUserPort;

    private final CheckUserExistsPort checkUserExistsPort;

    private final PasswordEncoder passwordEncoder;



    @Override

    @Transactional(readOnly = true)

    public List<User> listAllUsers() {

        log.info("Listing all users");

        return loadUsersPort.findAll();

    }

    @Override

    @Transactional

    public void createUser(CreateUserCommand command) {

        log.info("Creating user: {}", command.username());

        if (checkUserExistsPort.existsByUsername(command.username())) {

            throw new IllegalArgumentException("User already exists: " + command.username());

        }

        String encodedPassword = passwordEncoder.encode(command.rawPassword());

        Password password = Password.of(encodedPassword);

        User newUser = User.create(command.username(), password, command.roles());

        saveUserPort.save(newUser);

        log.info("User created successfully: {}", newUser.id());

    }

    @Override

    @Transactional

    public void updateUser(UpdateUserCommand command) {

        log.info("Updating user: {}", command.userId());

        User user = loadUserPort.loadUserById(command.userId())

                .orElseThrow(() -> new IllegalArgumentException("User not found: " + command.userId()));

        // Create updated user record (immutable)

        User updatedUser = new User(

                user.id(),

                user.username(),

                user.password(),

                command.roles(),

                command.active(),

                user.mustChangePassword()

        );

        saveUserPort.save(updatedUser);

        log.info("User updated successfully: {}", updatedUser.id());

    }

}




