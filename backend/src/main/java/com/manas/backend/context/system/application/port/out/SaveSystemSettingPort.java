package com.manas.backend.context.system.application.port.out;

import com.manas.backend.context.system.domain.SystemSetting;

public interface SaveSystemSettingPort {

    void save(SystemSetting setting);

}
