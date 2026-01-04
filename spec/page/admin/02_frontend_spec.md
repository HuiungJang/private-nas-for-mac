# Admin Page - Frontend Specification

**Based on:** `Admin_page.png` Sketch
**Version:** 1.1.0
**Updates:** Added Dashboard, Context Banner, Enhanced IP UX.

---

## 1. UI Layout & Navigation
The Admin interface uses a persistent Sidebar layout as depicted in the sketch.

### 1.1 Layout Structure (`AdminLayout.tsx`)
*   **Sidebar (Left, Fixed Width):**
    *   **Header:** "Admin" text + Current Admin Profile Avatar/Link.
    *   **Navigation Menu:**
        1. **Dashboard** (Icon: Dashboard) -> Routes to `/admin` (Home)
        2. **File** (Icon: Folder) -> Routes to `/admin/files`
        3. **Users** (Icon: People) -> Routes to `/admin/users`
        4. **Settings** (Icon: Settings) -> Routes to `/admin/settings`
*   **Main Content Area (Right, Scrollable):**
    *   Renders the active route component.
    *   Padding/Margins consistent with Material Design.

---

## 2. Views & Components

### 2.0 Dashboard (Home)
Default view when entering the Admin area.

*   **Components:**
    *   **`SystemHealthCards`:** Grid of cards showing:
        *   CPU Usage (Gauge/Progress bar)
        *   RAM Usage (Text: "4GB / 16GB")
        *   Storage Status (Per mounted volume)
    *   **`RecentActivityLog`:** Short list of recent Audit Logs (Login failures, File deletions).

### 2.1 File Manager View (`/admin/files`)
Corresponds to the "1. File" sketch.

*   **Context Awareness:**
    *   **`UserContextBanner`:** If `userId` query param is present (viewing a specific user's files), display a distinct banner at the top:
        *   *Text:* "Viewing files for user: **[Username]**"
        *   *Action:* "Exit to Root" button.
        *   *Style:* Warning/Info color to distinguish from normal admin file browsing.

*   **Components:**
    *   **`FileBreadcrumbs`:** Displays path.
    *   **`FileGrid`:**
        *   **Items:** Cards/Icons representing Files and Directories.
        *   **Visuals:** Folder icon for directories, File preview/icon for files.
    *   **Toolbar:** Search bar, View toggle (Grid/List), Multi-select actions (Delete, Move).

*   **Interactions:**
    *   **Context Menu (Right Click):** Delete, Rename, Download.
    *   **Drag & Drop:** Move files (restricted permissions check on backend).

### 2.2 User Management View (`/admin/users`)
Corresponds to the "2. Users" sketch.

*   **Components:**
    *   **`UserListTable`:**
        *   Columns: Username, Role, Status, Storage Used, Actions.
    *   **`UserActionMenu`:**
        *   "Manage Files" -> Redirects to `/admin/files?userId={id}`.
        *   "Edit Account" -> Opens `EditUserModal`.
        *   "Delete" -> Confirmation Dialog.
    *   **`CreateUserButton`:** Floating Action Button (FAB).

### 2.3 Settings View (`/admin/settings`)
Corresponds to the "3. Settings" sketch.

*   **Sections:**
    1.  **IP Manage (Allowed IP Manage):**
        *   **`IpAllowlistEditor`:**
            *   List of allowed IPs/CIDRs.
            *   **Validation:** Regex check for IPv4/IPv6/CIDR format.
            *   **Feature:** **"Add My Current IP"** button (fetches client IP and pre-fills input).
            *   **Safety Warning:** If deleting the current IP, show a modal warning "You will lose access immediately."
        *   **`GeoIpToggle`:** Switch to enable/disable Country-based blocking.
    2.  **VPN Manage:**
        *   **`VpnStatusCard`:** Shows Server Status (Running/Stopped).
        *   **`ToggleSwitch`:** Enable/Disable VPN Server.
    3.  **Theme Manage:**
        *   **`ThemeSelector`:** Radio buttons for "Light", "Dark", "System".
        *   **`AccentColorPicker`:** Color picker.

---

## 3. State Management (Frontend)

### 3.1 Store (Zustand)
*   `useAdminNavStore`: Sidebar state.
*   `useFileBrowserStore`: Path, Selection, Clipboard.

### 3.2 Server State (TanStack Query)
*   **Queries:**
    *   `['admin', 'dashboard']`: Fetches health stats.
    *   `['admin', 'users']`: Fetches user list.
    *   `['admin', 'files', path, userId]`: Fetches file list.
    *   `['admin', 'settings']`: Fetches system config.

---

## 4. Design System (Material UI)
*   **Theme:** Custom MUI Theme.
*   **Icons:** Material Icons.
*   **Typography:** Roboto.
