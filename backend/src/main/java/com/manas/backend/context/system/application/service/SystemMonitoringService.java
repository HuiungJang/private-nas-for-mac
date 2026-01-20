package com.manas.backend.context.system.application.service;

import com.manas.backend.context.system.application.port.in.GetSystemHealthUseCase;
import com.manas.backend.context.system.infrastructure.web.dto.SystemHealthDto;
import io.micrometer.core.instrument.MeterRegistry;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class SystemMonitoringService implements GetSystemHealthUseCase {

    private final MeterRegistry meterRegistry;
    private final Path storageRoot;

    public SystemMonitoringService(
            MeterRegistry meterRegistry,
            @Value("${app.storage.root}") String storageRootStr) {
        this.meterRegistry = meterRegistry;
        this.storageRoot = Paths.get(storageRootStr);
    }

    @Override
    public SystemHealthDto getSystemHealth() {
        double cpuUsage = getCpuUsage();
        long[] memory = getMemoryUsage();
        long[] storage = getStorageUsage();

        return new SystemHealthDto(
                cpuUsage,
                memory[0], // used
                memory[1], // total
                storage[0], // used
                storage[1]  // total
        );
    }

    private double getCpuUsage() {
        try {
            return meterRegistry.get("system.cpu.usage").gauge().value();
        } catch (Exception e) {
            log.warn("Failed to fetch CPU usage", e);
            return -1.0;
        }
    }

    private long[] getMemoryUsage() {
        try {
            long used = (long) meterRegistry.get("jvm.memory.used").gauge().value();
            long max = (long) meterRegistry.get("jvm.memory.max").gauge().value();
            return new long[]{used, max};
        } catch (Exception e) {
            log.warn("Failed to fetch Memory usage", e);
            return new long[]{-1, -1};
        }
    }

    private long[] getStorageUsage() {
        try {
            // Check if root exists, else create it or check parent
            if (!Files.exists(storageRoot)) {
                Files.createDirectories(storageRoot);
            }
            var store = Files.getFileStore(storageRoot);
            long total = store.getTotalSpace();
            long usable = store.getUsableSpace(); // Free space for unprivileged users
            long used = total - usable;
            return new long[]{used, total};
        } catch (IOException e) {
            log.error("Failed to fetch storage usage for path: {}", storageRoot, e);
            return new long[]{-1, -1};
        }
    }

}
