package com.manas.backend.context.system.application.service;

import com.manas.backend.context.system.application.port.in.GetSystemHealthUseCase;
import com.manas.backend.context.system.infrastructure.web.dto.SystemHealthDto;
import io.micrometer.core.instrument.MeterRegistry;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.Instant;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class SystemMonitoringService implements GetSystemHealthUseCase {

    private final MeterRegistry meterRegistry;
    private final Path storageRoot;
    private final Duration healthCacheTtl;

    private volatile SystemHealthDto cachedHealth;
    private volatile Instant cachedAt = Instant.EPOCH;

    public SystemMonitoringService(
            MeterRegistry meterRegistry,
            @Value("${app.storage.root}") String storageRootStr,
            @Value("${app.monitoring.health-cache-ttl-ms:2000}") long healthCacheTtlMs) {
        this.meterRegistry = meterRegistry;
        this.storageRoot = Paths.get(storageRootStr);
        this.healthCacheTtl = Duration.ofMillis(Math.max(0, healthCacheTtlMs));
        ensureStorageRoot();
    }

    @Override
    public SystemHealthDto getSystemHealth() {
        if (!healthCacheTtl.isZero()) {
            Instant now = Instant.now();
            SystemHealthDto snapshot = cachedHealth;
            if (snapshot != null && Duration.between(cachedAt, now).compareTo(healthCacheTtl) < 0) {
                return snapshot;
            }
        }

        double cpuUsage = getCpuUsage();
        long[] memory = getMemoryUsage();
        long[] storage = getStorageUsage();

        SystemHealthDto computed = new SystemHealthDto(
                cpuUsage,
                memory[0],
                memory[1],
                storage[0],
                storage[1]
        );

        cachedHealth = computed;
        cachedAt = Instant.now();
        return computed;
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
            var store = Files.getFileStore(storageRoot);
            long total = store.getTotalSpace();
            long usable = store.getUsableSpace();
            long used = total - usable;
            return new long[]{used, total};
        } catch (IOException e) {
            log.error("Failed to fetch storage usage for path: {}", storageRoot, e);
            return new long[]{-1, -1};
        }
    }

    private void ensureStorageRoot() {
        try {
            if (!Files.exists(storageRoot)) {
                Files.createDirectories(storageRoot);
            }
        } catch (IOException e) {
            log.warn("Failed to create storage root at startup: {}", storageRoot, e);
        }
    }

}
