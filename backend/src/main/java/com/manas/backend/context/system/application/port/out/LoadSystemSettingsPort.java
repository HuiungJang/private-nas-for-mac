package com.manas.backend.context.system.application.port.out;

import com.manas.backend.context.system.domain.SystemSetting;
import java.util.List;

public interface LoadSystemSettingsPort {

    List<SystemSetting> loadAll();

}
