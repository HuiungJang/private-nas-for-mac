# Plan: Implement Update IP Access API

## 1. Objective

Implement `PUT /api/admin/settings/ip-access` to update allowed VPN subnets.
Ensure these changes take effect immediately without restart.

## 2. Design Patterns & Features

- **Hexagonal Architecture**:
    - `IpConfigurationPort` (Auth Context Output Port) to fetch config.
    - `SystemIpConfigurationAdapter` (System Context Adapter) to implement it.
- **Event-Driven Updates**:
    - `IpAccessChangedEvent` to notify Auth context of changes.
    - `IpEnforcementFilter` subscribes to updates.
- **Validation**:
    - Validate CIDR notation / IP format using regex or library.

## 3. Risks

- **Lockout**: If Admin saves an invalid or non-VPN IP, they might lock themselves out immediately.
    - *Mitigation*: Validate that the *current request IP* is included in the new allowlist before
      saving.
- **Persistence**: Settings must persist across restarts.

## 4. Implementation Steps

### Step 1: Define Event & Port (Auth Context)

- Create `IpAccessChangedEvent` (Domain Event).
- Create `IpConfigurationPort` (Interface).
- Modify `IpEnforcementFilter`:
    - Inject `IpConfigurationPort`.
    - Load initial config on construction/init.
    - Add `@EventListener` for `IpAccessChangedEvent` to reload.

### Step 2: Implement Port (System Context)

- Create `SystemIpConfigurationAdapter` in `context.system`.
    - Implements `IpConfigurationPort`.
    - Reads from `JpaSystemSettingRepository`.
    - Falls back to `@Value("${security.vpn.allowed-subnets}")`.

### Step 3: Application Layer (System Service)

- Update `SystemSettingsService`.
    - Implement `UpdateIpAccessUseCase`.
    - Logic:
        - Validate IPs (CIDR format).
        - **Crucial:** Check if current user's IP is covered by new list (prevent lockout).
        - Save to `SystemSetting` ("security.ip.allowed-subnets").
        - Publish `IpAccessChangedEvent`.
    - Update `getSettings` to return IP list.

### Step 4: Web Layer

- Create `IpAccessConfigDto`.
- Update `SystemSettingsController`.
    - `PUT /api/admin/settings/ip-access`.

### Step 5: Testing

- Test Lockout prevention.
- Test Event propagation.

## 5. Verification

- Run tests.
