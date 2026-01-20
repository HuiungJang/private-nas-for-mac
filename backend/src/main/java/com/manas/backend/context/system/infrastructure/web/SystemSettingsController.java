package com.manas.backend.context.system.infrastructure.web;

import com.manas.backend.context.system.application.port.in.GetSystemSettingsUseCase;
import com.manas.backend.context.system.application.port.in.UpdateThemeCommand;
import com.manas.backend.context.system.application.port.in.UpdateThemeUseCase;
import com.manas.backend.context.system.infrastructure.web.dto.SystemSettingsResponse;
import com.manas.backend.context.system.infrastructure.web.dto.ThemeConfigDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController

@RequestMapping("/api/admin/settings")

@RequiredArgsConstructor

public class SystemSettingsController {

    private final UpdateThemeUseCase updateThemeUseCase;

    private final GetSystemSettingsUseCase getSystemSettingsUseCase;

    @GetMapping

    @PreAuthorize("hasRole('ADMIN')")

    public ResponseEntity<SystemSettingsResponse> getSettings() {

        return ResponseEntity.ok(getSystemSettingsUseCase.getSettings());

    }



    @PutMapping("/theme")

    @PreAuthorize("hasRole('ADMIN')")

    public ResponseEntity<Void> updateTheme(@Valid @RequestBody ThemeConfigDto request) {

        UpdateThemeCommand command = new UpdateThemeCommand(request.mode(), request.primaryColor());

        updateThemeUseCase.updateTheme(command);

        return ResponseEntity.ok().build();

    }

}


