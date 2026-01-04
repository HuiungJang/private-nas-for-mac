# Admin Page - Backend Specification

**Based on:** `Admin_page.png` Sketch & Master Spec
**Version:** 1.0.0

---

## 1. Overview
The Admin Page backend provides the API surface for system administrators to manage files, users, and system-wide settings. All endpoints defined here require `ROLE_ADMIN` authority.

---

## 2. API Endpoints

### 2.1 File Management (Admin View)
Admins need to browse the entire file system or specific user directories.

*   **GET** `/api/admin/files/list`
    *   **Query Params:**
        *   `path` (String, optional): The absolute path to list. Defaults to root.
        *   `userId` (UUID, optional): If provided, roots the view to that specific user's home directory.
    *   **Response:** `DirectoryListingDTO`
        *   `currentPath`: String
        *   `breadcrumbs`: List<`PathNodeDTO`> (Name, Path)
        *   `items`: List<`FileNodeDTO`> (Name, Type, Size, ModTime, Owner)

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
        *   `ipAccessControl`: `IpControlDTO` (Allowlist, Blocklist)
        *   `vpnConfig`: `VpnConfigDTO` (Status, Provider - *Placeholder per sketch*)
        *   `themeConfig`: `ThemeConfigDTO` (Default system theme)

*   **PUT** `/api/admin/settings/ip-access`
    *   **Request:** `IpControlDTO`
        *   `allowedIps`: List<String> (CIDR supported)
        *   `geoIpEnabled`: Boolean
    *   **Logic:** Updates the firewall/interceptor rules immediately.

*   **PUT** `/api/admin/settings/theme`
    *   **Request:** `ThemeConfigDTO`
        *   `primaryColor`: String
        *   `darkModeDefault`: Boolean
    *   **Note:** "Theme manage" from sketch.

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
*   **Audit Logging:** Critical actions (User Create/Delete, Settings Change) must generate an `AuditLog` entry (Actor, Action, Target, Timestamp).
