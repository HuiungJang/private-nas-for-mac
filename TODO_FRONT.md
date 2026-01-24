# Frontend Implementation Plan (React/Vite)

**Based on:** `spec/00_master_spec.md`, `spec/01_technical_architecture.md`,
`spec/page/admin/02_frontend_spec.md`

---

## 🛠 Tech Stack & Tools

- **Framework:** React 18+
- **Build Tool:** Vite (TypeScript)
- **UI Library:** Material UI (MUI) v6 (Customized for **iOS 17** Aesthetics)
- **State Management:**
    - **Server State:** TanStack Query (React Query) v5
    - **Client State:** Zustand
- **Router:** React Router v6
- **HTTP Client:** Axios (Trace ID integration)
- **Icons:** MUI Icons / Lucide React

---

## 🏗 Architecture: Feature-Sliced Design (FSD)

The source code will be organized according to FSD principles:

```text
src/
├── app/                    # Providers (Theme, QueryClient, Router), Global Styles
├── entities/               # Business Entities (Domain Models)
│   ├── user/               # User model, hooks (useUser)
│   ├── file/               # File model, hooks (useFileTree)
│   └── audit/              # AuditLog model
├── features/               # User Interactions (Complex Logic)
│   ├── auth/               # Login form, Logout button
│   ├── file-browser/       # File Explorer Logic (Selection, Drag&Drop)
│   ├── file-actions/       # Buttons: Upload, Delete, Move, Rename
│   └── admin-dashboard/    # System stats, User management table
├── widgets/                # Composition of Features (Layout Components)
│   ├── sidebar/            # Navigation Menu
│   ├── header/             # Search bar, User profile, Breadcrumbs
│   └── file-table/         # The main grid/list view of files
├── pages/                  # Routing Pages
│   ├── login/              # Login Page
│   ├── dashboard/          # Home / File Browser Page
│   └── admin/              # Admin Settings Page
└── shared/                 # Reusable UI Kit, API Client, Utils
    ├── api/                # axios instance with interceptors
    ├── ui/                 # Custom Buttons, Inputs, Modals
    └── lib/                # trace-id generator, date formatting
```

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation & Scaffolding

- [x] **Project Setup:** Initialize Vite + React + TypeScript.
- [x] **Config:** Setup `tsconfig`, `eslint`, `prettier` (AirBnB or Google style).
- [x] **Docker:** Create `Dockerfile` and update `docker-compose.yml`.
- [x] **Proxy:** Configure Vite proxy to backend (`/api` -> `http://localhost:8080`).
- [x] **FSD Structure:** Create directory structure.
- [x] **Shared Layer:**
  - [x] Setup Axios with `X-Trace-ID` interceptor.
  - [x] Setup MUI Theme (Dark/Light mode support).

### Phase 2: Authentication (Auth Context)

- [x] **Entities/User:** Define `User` type and `useAuth` store (Zustand).
- [x] **Features/Auth:** Implement `LoginForm` component.
- [x] **Pages/Login:** Create Login Page.
- [x] **App/Router:** Protected Routes (Require Login).

### Phase 3: File Browser Core (File Context)

- [x] **Entities/File:** Define `FileNode` type, `useFiles` (React Query).
- [x] **Widgets/FileTable:**
  - [x] Render List/Grid view.
  - [x] Breadcrumb navigation.
  - [x] File Icon integration.
- [x] **Features/FileBrowser:**
  - [x] Directory Navigation (Click to enter).
  - [x] Path State Management.

### Phase 4: File Operations (Actions)

- [x] **Features/FileActions:**
  - [x] **Delete:** Multi-select + Delete confirmation.
  - [x] **Move:** "Move to..." modal with folder picker.
  - [x] **Upload:** Upload button (basic).

### Phase 5: Admin & Observability

- [x] **Pages/Admin:** Admin Dashboard layout.
- [x] **Widgets/UserTable:** List/Add/Delete users.
- [x] **Widgets/SystemHealth:** View System Health (CPU/RAM/Storage).
- [x] **Widgets/AuditLog:** View `audit_logs` table (Trace ID visualization).

### Phase 6: Responsive Design (Mobile Adaptation)

- [x] **Global Layout:** Ensure `PageLayout` handles mobile padding/margins correctly.
- [x] **Login Page:** Full-width layout on mobile, optimized spacing.
- [x] **Dashboard:**
  - [x] **Breadcrumbs:** Horizontal scroll support for deep paths on mobile.
  - [x] **File Table:** Switch to `List` view on mobile (Hide detailed columns, show primary info
    only).
  - [x] **Actions:** Optimize button placement for touch.

### Phase 7: Polish

- [ ] **Error Handling:** Toast notifications (Snackbar) for API errors.
