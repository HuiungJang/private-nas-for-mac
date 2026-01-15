package com.manas.backend.context.auth.application.service;

import com.manas.backend.context.auth.application.port.in.ListUsersUseCase;
import com.manas.backend.context.auth.application.port.out.LoadUsersPort;
import com.manas.backend.context.auth.domain.User;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserManagementService implements ListUsersUseCase {

    private final LoadUsersPort loadUsersPort;

    @Override
    @Transactional(readOnly = true)
    public List<User> listAllUsers() {
        log.info("Listing all users");
        return loadUsersPort.findAll();
    }

}
