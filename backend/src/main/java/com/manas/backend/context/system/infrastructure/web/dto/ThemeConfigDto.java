package com.manas.backend.context.system.infrastructure.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ThemeConfigDto(
        @NotBlank(message = "Theme mode is required")
        @Pattern(regexp = "^(light|dark|system)$", message = "Mode must be light, dark, or system")
        String mode,

        @NotBlank(message = "Primary color is required")
        @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Invalid Hex color code")
        String primaryColor
) {

}
