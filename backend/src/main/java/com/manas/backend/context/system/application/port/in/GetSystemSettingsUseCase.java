package com.manas.backend.context.system.application.port.in;

import com.manas.backend.context.system.infrastructure.web.dto.SystemSettingsResponse;

public interface GetSystemSettingsUseCase {

    SystemSettingsResponse getSettings();

}
