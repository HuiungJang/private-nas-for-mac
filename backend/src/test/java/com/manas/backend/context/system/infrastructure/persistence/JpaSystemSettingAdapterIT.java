package com.manas.backend.context.system.infrastructure.persistence;

import static org.assertj.core.api.Assertions.assertThat;

import com.manas.backend.TestcontainersConfiguration;
import com.manas.backend.context.system.domain.SystemSetting;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
class JpaSystemSettingAdapterIT {

    @Autowired
    private JpaSystemSettingAdapter adapter;

    @Test
    @DisplayName("Should save and load settings")
    void shouldSaveAndLoadSettings() {
        // Given
        SystemSetting setting1 = new SystemSetting("test.key", "test.value");
        SystemSetting setting2 = new SystemSetting("test.key2", "value2");

        // When
        adapter.save(setting1);
        adapter.save(setting2);
        List<SystemSetting> settings = adapter.loadAll();

        // Then
        assertThat(settings).hasSizeGreaterThanOrEqualTo(2);
        assertThat(settings).extracting(SystemSetting::key)
                .contains("test.key", "test.key2");
        assertThat(settings).extracting(SystemSetting::value)
                .contains("test.value", "value2");
    }

}
