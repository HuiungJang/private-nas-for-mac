package com.manas.backend.context.auth.infrastructure.web;

import com.manas.backend.context.auth.application.port.in.ListUsersUseCase;
import com.manas.backend.context.auth.domain.User;
import com.manas.backend.context.auth.infrastructure.web.dto.UserSummaryDto;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final ListUsersUseCase listUsersUseCase;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserSummaryDto>> listUsers() {
        List<User> users = listUsersUseCase.listAllUsers();

        List<UserSummaryDto> response = users.stream()
                .map(this::toDto)
                .toList();

        return ResponseEntity.ok(response);
    }

    private UserSummaryDto toDto(User user) {
        return new UserSummaryDto(
                user.id(),
                user.username(),
                user.roles()
        );
    }

}
