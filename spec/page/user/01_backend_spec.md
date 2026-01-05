# User Page - Backend Specification

**Based on:** `User_page.jpg` Sketch & Master Spec
**Version:** 1.0.1
**Updates:** Added Filename Validation & Sanitization.

---

## 1. Overview
The User Page backend provides the API surface for standard users to manage their personal files, account profile, and preferences. All endpoints defined here require `ROLE_USER` authority and must be strictly scoped to the authenticated user.

---

## 2. API Endpoints

### 2.1 File Management (Personal Storage)
Users interact with their own isolated file system space.

*   **GET** `/api/user/files/list`
    *   **Query Params:**
        *   `path` (String, optional): The relative path from the user's root. Defaults to `/`.
    *   **Response:** `DirectoryListingDTO`
        *   `currentPath`: String (Relative)
        *   `breadcrumbs`: List<`PathNodeDTO`>
        *   `items`: List<`FileNodeDTO`> (Name, Type, Size, ModTime)

*   **POST** `/api/user/files/folder`
    *   **Request:** `CreateFolderDTO` (Path, Name)
    *   **Validation:** Name must be sanitized (see Security Requirements).

*   **POST** `/api/user/files/upload`
    *   **Request:** Multipart File + `path`
    *   **Response:** `FileNodeDTO`
    *   **Validation:** Original filename must be sanitized.

*   **POST** `/api/user/files/delete`
    *   **Request:** `FileActionDTO` (List of relative paths)
    *   **Response:** `BatchOperationResultDTO`

*   **POST** `/api/user/files/move`
    *   **Request:** `FileMoveDTO` (Source Paths, Destination Path)

*   **POST** `/api/user/files/rename`
    *   **Request:** `FileRenameDTO` (Path, New Name)
    *   **Validation:** New Name must be sanitized.

*   **GET** `/api/user/files/download`
    *   **Query Params:** `path`
    *   **Response:** Binary stream (File content)

### 2.2 Account Management
Corresponds to the "2. Account" > "1. Profiles Manage" menu in the sketch.

*   **GET** `/api/user/profile`
    *   **Response:** `UserProfileDTO`
        *   `username`: String
        *   `email`: String (if applicable)
        *   `avatarUrl`: String
        *   `storageUsed`: Long (bytes)
        *   `storageLimit`: Long (bytes, if quotas exist)

*   **PUT** `/api/user/profile`
    *   **Request:** `UpdateProfileDTO`
        *   `password`: String (Optional - change password)
        *   `email`: String (Optional)
    *   **Validation:** Current password required for password changes.

### 2.3 User Settings
Corresponds to the "3. Settings" > "1. Theme Manage" menu in the sketch.

*   **GET** `/api/user/settings`
    *   **Response:** `UserSettingsDTO`
        *   `themeConfig`: `ThemeConfigDTO`

*   **PUT** `/api/user/settings/theme`
    *   **Request:** `ThemeConfigDTO`
        *   `primaryColor`: String
        *   `darkMode`: Boolean (or "SYSTEM")

---

## 3. Data Models (DTOs)

### 3.1 DirectoryListingDTO
```java
public record DirectoryListingDTO(
    String currentPath,
    List<PathNodeDTO> breadcrumbs,
    List<FileNodeDTO> items
) {}
```

### 3.2 UserProfileDTO
```java
public record UserProfileDTO(
    String username,
    String email,
    String avatarUrl,
    long storageUsed,
    long storageLimit
) {}
```

---

## 4. Security Requirements
*   **Authorization:** All endpoints under `/api/user/**` must be secured with `@PreAuthorize("hasRole('USER')")`.
*   **Data Isolation:**
    *   **CRITICAL:** The backend **MUST** resolve file paths relative to the authenticated user's home directory (e.g., `/mnt/nas/users/{userId}/...`).
    *   **Path Traversal Prevention:** Any request containing `..` or attempting to access paths outside the user's root must be rejected with `403 Forbidden` or `400 Bad Request`.
*   **Input Sanitization (Filenames):**
    *   **Strict Blocklist:** Filenames MUST NOT contain:
        *   Directory separators: `/` or `\`
        *   Relative path components: `..`
        *   Control characters (0x00-0x1F)
    *   **Length:** Maximum 255 characters.
    *   **Resolution:** Invalid characters should either cause a `400 Bad Request` or be automatically replaced/sanitized (e.g., `_`) depending on UX policy.
*   **Rate Limiting:** Apply reasonable limits to file uploads/downloads to prevent resource exhaustion.