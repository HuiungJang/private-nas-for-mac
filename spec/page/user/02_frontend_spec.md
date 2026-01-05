# User Page - Frontend Specification

**Based on:** `User_page.jpg` Sketch
**Version:** 1.0.0

---

## 1. UI Layout & Navigation
The User interface uses a persistent Sidebar layout, similar to the Admin page but simplified for personal usage.

### 1.1 Layout Structure (`UserLayout.tsx`)
*   **Sidebar (Left, Fixed Width):**
    *   **Header ("Profiles" in sketch):**
        *   **User Avatar:** Circular image/initials.
        *   **Username:** Display name.
        *   **Storage Bar:** Small progress bar showing usage (e.g., "50GB / 1TB").
    *   **Navigation Menu:**
        1. **Files** (Icon: Folder) -> Routes to `/user/files`
        2. **Account** (Icon: Person) -> Routes to `/user/account`
        3. **Settings** (Icon: Settings) -> Routes to `/user/settings`
*   **Main Content Area (Right, Scrollable):**
    *   Renders the active route component.

---

## 2. Views & Components

### 2.1 File Manager View (`/user/files`)
Corresponds to "1. Files" in the sketch (Directory Tree A > B > C... and File Icons).

*   **Layout:**
    *   **Top Bar:**
        *   **Breadcrumbs:** "Home > Documents > Work" (Clickable).
        *   **Actions:** "Upload" (Button with Icon), "New Folder" (Icon Button).
        *   **View Switcher:** Grid vs List toggle.
        *   **Search:** Filter files in current view.
    *   **Content Area:**
        *   **`FileGrid` / `FileList`:** Displays contents.
            *   **Directories:** Folder icons. Double-click to navigate.
            *   **Files:** Preview thumbnails (images) or generic file type icons.
        *   **Empty State:** "No files here. Drag & drop to upload."

*   **Interactions:**
    *   **Selection:** Single click to select, Cmd/Ctrl+Click for multi-select.
    *   **Context Menu (Right Click):**
        *   Download
        *   Rename
        *   Move to...
        *   Delete (Prompts confirmation)
    *   **Drag & Drop:**
        *   **External:** Drag files from OS into browser to upload.
        *   **Internal:** Drag files into folders to move.

### 2.2 Account View (`/user/account`)
Corresponds to "2. Account" > "1. Profiles Manage" in the sketch.

*   **Components:**
    *   **`ProfileCard`:**
        *   Avatar upload/change.
        *   Display Name edit.
        *   Email/Contact info (ReadOnly or Editable based on policy).
    *   **`SecurityCard`:**
        *   **Change Password:** Inputs for "Current Password", "New Password", "Confirm".

### 2.3 Settings View (`/user/settings`)
Corresponds to "3. Settings" > "1. Theme Manage" in the sketch.

*   **Components:**
    *   **`ThemePreferences`:**
        *   **Mode:** "Light", "Dark", "System Default".
        *   **Primary Color:** Selector for UI accent color.

---

## 3. State Management (Frontend)

### 3.1 Store (Zustand)
*   `useUserNavStore`: Sidebar toggle state (mobile).
*   `useUserFileStore`:
    *   `currentPath`: String
    *   `selectedFiles`: Array<String>
    *   `viewMode`: 'grid' | 'list'
    *   `uploadQueue`: Array<File> (for progress tracking)

### 3.2 Server State (TanStack Query)
*   **Queries:**
    *   `['user', 'profile']`: Fetches user info & storage quota.
    *   `['user', 'files', path]`: Fetches directory contents.
    *   `['user', 'settings']`: Fetches theme config.

---

## 4. Design System (Material UI)
*   **Consistent with Admin:** Reuses the same theme engine but applies user-specific preferences if set.
*   **Responsiveness:**
    *   Sidebar becomes a drawer (hamburger menu) on mobile screens.
    *   File Grid adapts column count based on screen width.
