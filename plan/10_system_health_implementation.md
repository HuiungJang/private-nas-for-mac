# Plan: Implement System Health API

## 1. Objective

Implement `GET /api/admin/system/health` to return current system status (CPU, RAM, Storage).

## 2. Design Patterns & Features

- **Micrometer (MeterRegistry)**: Use Spring Boot's built-in metrics facade to fetch CPU/RAM.
- **Java NIO FileStore**: Use `FileStore` to get accurate disk usage for the configured storage
  root (`/mnt/host_volumes`).
- **Hexagonal Architecture**:
    - `GetSystemHealthUseCase` (Input Port).
    - `SystemMonitoringService` (Application).
    - `SystemHealthDto` (Web DTO).

## 3. Risks

- **Metric Availability**: Some metrics (`system.cpu.usage`) might not be available in all
  environments (containers). Fallback to `-1` or `0`.
- **Storage Path**: Must ensure we check the *actual* storage volume, not just the container's root.

## 4. Implementation Steps

### Step 1: Configuration

- Add `spring-boot-starter-actuator` to `build.gradle.kts`.

### Step 2: DTO & Ports

- Create `SystemHealthDto`:
    - `cpuUsage` (double, percentage).
    - `memoryUsed` (long, bytes).
    - `memoryTotal` (long, bytes).
    - `storageUsed` (long, bytes).
    - `storageTotal` (long, bytes).
- Create `GetSystemHealthUseCase`.

### Step 3: Application Service

- Create `SystemMonitoringService`.
- Inject `MeterRegistry` and `storage.root` path.
- Logic:
    - Fetch `system.cpu.usage`.
    - Fetch `jvm.memory.used/max` (or `system.memory` if accessible, but JVM is safer). Let's try
      `system.memory` metrics if available, otherwise JVM. Actually, for a NAS, Host memory is more
      interesting. Actuator usually exposes `system.cpu.usage` and `system.cpu.count`. Memory might
      be restricted to JVM in standard metrics. I'll stick to JVM memory for now, or use
      `OperatingSystemMXBean` for host memory if needed.
    - Fetch Disk usage for `storage.root`.

### Step 4: Web Layer

- Update `SystemController` (renaming `SystemSettingsController` or adding new one? The previous one
  was `SystemSettingsController` for settings. This is `SystemMonitoringController` or just
  `SystemController` for `/api/admin/system/...`). Let's create `SystemMonitoringController`.

### Step 5: Testing

- Integration test ensuring metrics are retrieved.

## 5. Verification

- Run tests.
