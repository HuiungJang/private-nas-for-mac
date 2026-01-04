# Admin Page - Frontend Specification

**Based on:** `Admin_page.jpg` Sketch
**Version:** 1.0.0

---

## 1. UI Layout & Navigation
The Admin interface uses a persistent Sidebar layout as depicted in the sketch.

### 1.1 Layout Structure (`AdminLayout.tsx`)
*   **Sidebar (Left, Fixed Width):**
    *   **Header:** "Admin" text + Current Admin Profile Avatar/Link.
    *   **Navigation Menu:**
        1.  **File** (Icon: Folder) -> Routes to `/admin/files`
        2.  **Users** (Icon: People) -> Routes to `/admin/users`
        3.  **Settings** (Icon: Settings) -> Routes to `/admin/settings`
*   **Main Content Area (Right, Scrollable):**
    *   Renders the active route component.
    *   Padding/Margins consistent with Material Design.

---

## 2. Views & Components

### 2.1 File Manager View (`/admin/files`)
Corresponds to the "1. File" sketch.

*   **Components:**
    *   **`FileBreadcrumbs`:** Displays path `Root > Folder A > Folder B`. Clickable to navigate up.
    *   **`FileGrid`:**
        *   **Items:** Cards/Icons representing Files and Directories.
        *   **Visuals:** Folder icon for directories, File preview/icon for files.
        *   **Labels:** Filename displayed below the icon.
    *   **Toolbar (Optional but implied):** Search bar, View toggle (Grid/List).

*   **Interactions:**
    *   **Single Click:** Select item.
    *   **Double Click:** Enter directory.
    *   **Context Menu (Right Click):** Delete, Rename, Download (Admin privileges).

### 2.2 User Management View (`/admin/users`)
Corresponds to the "2. Users" sketch.

*   **Components:**
    *   **`UserListTable`:**
        *   Columns: Username, Role, Status, Storage Used, Actions.
    *   **`UserActionMenu`:**
        *   "Manage Files" -> Redirects to `/admin/files?userId={id}`.
        *   "Edit Account" -> Opens `EditUserModal`.
        *   "Delete" -> Confirmation Dialog.
    *   **`CreateUserButton`:** Floating Action Button (FAB) or Toolbar button.

*   **Sub-Feature: "User's File Manage"**
    *   When an admin selects a user, the **File Manager View** is reused but scoped to that user's root directory.

### 2.3 Settings View (`/admin/settings`)
Corresponds to the "3. Settings" sketch.

*   **Structure:**
    *   A dashboard-like page or Tabs interface for categorized settings.

*   **Sections:**
    1.  **IP Manage (Allowed IP Manage):**
        *   **`IpAllowlistEditor`:** List of allowed IPs/CIDRs. Add/Remove buttons.
        *   **`GeoIpToggle`:** Switch to enable/disable Country-based blocking.
    2.  **VPN Manage:**
        *   *Display Only / Configuration:* Toggle for VPN requirement or connection status display.
    3.  **Theme Manage:**
        *   **`ThemeSelector`:** Radio buttons or cards for "Light", "Dark", "System".
        *   **`AccentColorPicker`:** Color picker for main UI color.

---

## 3. State Management (Frontend)

### 3.1 Store (Zustand)
*   `useAdminNavStore`: Tracks sidebar open/close state (mobile), active menu item.
*   `useFileBrowserStore`: Tracks current path, selected items, clipboard (copy/paste).

### 3.2 Server State (TanStack Query)
*   **Queries:**
    *   `['admin', 'users']`: Fetches user list.
    *   `['admin', 'files', path]`: Fetches file list for a specific path.
    *   `['admin', 'settings']`: Fetches system config.
*   **Mutations:**
    *   `useCreateUser`: Invalidates `['admin', 'users']`.
    *   `useUpdateSettings`: Updates settings and shows Toast notification.

---

## 4. Design System (Material UI)
*   **Theme:** Custom MUI Theme mirroring the "Theme Manage" settings.
*   **Icons:** Material Icons (Folder, Group, Settings, Shield/Security for VPN).
*   **Typography:** Roboto (default MUI).
