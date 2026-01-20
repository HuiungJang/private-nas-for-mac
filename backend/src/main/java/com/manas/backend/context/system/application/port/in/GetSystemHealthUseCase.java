package com.manas.backend.context.system.application.port.in;

import com.manas.backend.context.system.infrastructure.web.dto.SystemHealthDto;

public interface GetSystemHealthUseCase {

    SystemHealthDto getSystemHealth();

}
