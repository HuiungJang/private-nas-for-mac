package com.manas.backend.context.system.infrastructure.web;

import com.manas.backend.context.system.application.port.in.GetSystemHealthUseCase;
import com.manas.backend.context.system.infrastructure.web.dto.SystemHealthDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/system")
@RequiredArgsConstructor
public class SystemMonitoringController {

    private final GetSystemHealthUseCase getSystemHealthUseCase;

    @GetMapping("/health")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemHealthDto> getSystemHealth() {
        return ResponseEntity.ok(getSystemHealthUseCase.getSystemHealth());
    }

}
