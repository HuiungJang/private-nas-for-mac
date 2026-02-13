package com.manas.backend.context.auth.infrastructure.web;

import com.manas.backend.context.auth.application.port.in.LoginUseCase;
import com.manas.backend.context.auth.application.port.in.LoginResult;
import com.manas.backend.context.auth.infrastructure.web.dto.ChangePasswordRequest;
import com.manas.backend.context.auth.infrastructure.web.dto.LoginRequest;
import com.manas.backend.context.auth.infrastructure.web.dto.LoginResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final LoginUseCase loginUseCase;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResult result = loginUseCase.login(request.username(), request.password());
        return ResponseEntity.ok(new LoginResponse(result.token(), result.mustChangePassword()));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new SecurityException("Unauthenticated request");
        }

        loginUseCase.changePassword(authentication.getName(), request.currentPassword(),
                request.newPassword());
        return ResponseEntity.ok().build();
    }

}
