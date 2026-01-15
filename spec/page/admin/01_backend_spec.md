# Admin Page - Backend Specification

**Based on:** `Admin_page.png` Sketch & Master Spec
**Version:** 1.1.1
**Updates:** Added Security Mitigations (Proxy Awareness, Path Restriction).

---

## 1. Overview
The Admin Page backend provides the API surface for system administrators to manage files, users, and system-wide settings. All endpoints defined here require `ROLE_ADMIN` authority.

---

## 2. API Endpoints

### 2.1 File Management (Admin View)
Admins need to browse and manage the entire file system or specific user directories.

*   **GET** `/api/admin/files/list`
    *   **Query Params:**
        *   `path` (String, optional): The absolute path to list. Defaults to configured storage root.
        *   `userId` (UUID, optional): If provided, roots the view to that specific user's home directory.
    *   **Response:** `DirectoryListingDTO`
        *   `currentPath`: String
        *   `breadcrumbs`: List<`PathNodeDTO`> (Name, Path)
        *   `items`: List<`FileNodeDTO`> (Name, Type, Size, ModTime, Owner)
    *   **SECURITY NOTE (Path Scope):**
        *   The backend **MUST** restrict access to the host's mounted volumes (e.g., `/Volumes/...`) or the defined data directory.
        *   Access to the container's root file system (`/`, `/etc`, `/var`, etc.) is **strictly prohibited**.
        *   Any path not starting with the allowed prefix must return `403 Forbidden` or `400 Bad Request`.

*   **POST** `/api/admin/files/delete`
    *   **Purpose:** Admin privileged delete (bypassing standard user ownership checks if necessary, but logging is critical).
    *   **Request:** `FileActionDTO` (List of paths)
    *   **Response:** `BatchOperationResultDTO` (Success/Fail counts)

*   **POST** `/api/admin/files/move`
    *   **Request:** `FileMoveDTO` (Source Paths, Destination Path)

### 2.2 User Management
Corresponds to the "2. USERS" menu in the sketch.

*   **GET** `/api/admin/users`
    *   **Response:** `Page<UserSummaryDTO>`
        *   `id`: UUID
        *   `username`: String
        *   `role`: String (ADMIN/USER)
        *   `status`: String (ACTIVE/LOCKED)
        *   `storageUsed`: Long (bytes)

*   **POST** `/api/admin/users`
    *   **Request:** `CreateUserDTO`
        *   `username`: String
        *   `password`: String
        *   `role`: Enum
    *   **Response:** `UserDetailDTO`

*   **PUT** `/api/admin/users/{userId}`
    *   **Request:** `UpdateUserDTO`
        *   `password`: String (Optional - reset)
        *   `status`: Enum (ACTIVE/LOCKED)
        *   `role`: Enum
    *   **Note:** "Account manage" from sketch.

*   **GET** `/api/admin/users/{userId}/files`
    *   **Purpose:** Shortcut to jump to the File Manager view filtered for this user ("User's File manage" from sketch).
    *   **Response:** Redirect or path information to initialize the file browser.

### 2.3 System Settings
Corresponds to the "3. Settings" menu in the sketch.

*   **GET** `/api/admin/settings`
    *   **Response:** `SystemSettingsDTO`
        *   `ipAccessControl`: `IpControlDTO`
        *   `vpnConfig`: `VpnConfigDTO`
        *   `themeConfig`: `ThemeConfigDTO`

*   **PUT** `/api/admin/settings/ip-access`
    *   **Request:** `IpControlDTO`
        *   `allowedIps`: List<String> (CIDR supported)
        *   `geoIpEnabled`: Boolean
    *   **Safety Logic (Validation):**
        *   **MUST** check if the requester's current IP matches one of the allowed CIDRs/IPs.
        *   **If not matched:** Reject the request with `400 Bad Request` ("Cannot block current session IP").
    *   **SECURITY NOTE (Proxy Awareness):**
        *   Since the app runs behind Nginx/Docker, `request.getRemoteAddr()` may return the internal gateway IP.
        *   The application **MUST** be configured to trust and parse `X-Forwarded-For` or `Forwarded` headers to identify the **actual** VPN client IP.
        *   Ensure Spring Boot's `server.forward-headers-strategy` is set to `NATIVE` or `FRAMEWORK`.

*   **PUT** `/api/admin/settings/vpn`
    *   **Request:** `VpnConfigDTO`
        *   `enabled`: Boolean
        *   `provider`: String (e.g., "WIREGUARD", "TAILSCALE") - *Future implementation*
    *   **Note:** Controls the internal VPN server status.

*   **PUT** `/api/admin/settings/theme`
    *   **Request:** `ThemeConfigDTO`
        *   `primaryColor`: String
        *   `darkModeDefault`: Boolean

### 2.4 System Health (Dashboard)
New requirement based on Master Spec to support the Admin Dashboard.

*   **GET** `/api/admin/system/health`
    *   **Response:** `SystemHealthDTO`
        *   `cpuUsagePercent`: Double
        *   `ramUsage`: `MemoryUsageDTO` (Used, Total)
        *   `storageUsage`: `StorageUsageDTO` (Volume Label, Used, Total)
        *   `uptime`: Long (seconds)
        *   `jvmStatus`: String (Heap usage, Thread count)

---

## 3. Data Models (DTOs)

### 3.1 UserSummaryDTO
```java
public record UserSummaryDTO(
    UUID id,
    String username,
    Role role,
    AccountStatus status,
    long storageUsed
) {}
```

### 3.2 SystemSettingsDTO
```java
public record SystemSettingsDTO(
    IpControlDTO ipAccessControl,
    VpnConfigDTO vpnConfig,
    ThemeConfigDTO themeConfig
) {}
```

---

## 4. Security Requirements
*   **Authorization:** All endpoints under `/api/admin/**` must be secured with `@PreAuthorize("hasRole('ADMIN')")`.
*   **Audit Logging:**
    *   **User Mgmt:** Create/Delete/Modify User.
    *   **File Mgmt:** Admin-initiated Delete/Move (Must log "Admin {username} deleted file {path} owned by {owner}").
    *   **Settings:** Any change to IP or Security settings.

---

## 5. Infrastructure Security Requirements

* **CORS Configuration:**
    * **MUST** restrict `Access-Control-Allow-Origin` to configured frontend origins only via
      `cors.allowed-origins` property.
    * Do NOT use wildcard (`*`) in production environments.
    * Allowed headers: `Authorization`, `Content-Type`, `X-Trace-ID`.
    * Exposed headers: `X-Trace-ID` for end-to-end tracing.
* **Proxy/Forwarded Headers:**
    * `server.forward-headers-strategy: native` **MUST** be configured in `application.yml`.
    * This ensures proper parsing of `X-Forwarded-For` headers from Docker/Nginx reverse proxy.
* **Secrets Management:**
    * All secrets (JWT, database passwords) **MUST** be externalized via environment variables.
    * Configuration: `jwt.secret: ${JWT_SECRET:dev_fallback}`,
      `password: ${NAS_PASSWORD:dev_fallback}`
    * Production deployments **MUST** set these environment variables; do not rely on fallback
      values.
* **Disk Space Validation:**
    * File upload operations **MUST** check available disk space before writing.
    * Maintain 10% safety buffer to prevent partial writes and filesystem corruption.
