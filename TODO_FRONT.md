# Frontend Implementation Plan (React/Vite)

**Based on:** `spec/00_master_spec.md`, `spec/01_technical_architecture.md`,
`spec/page/admin/02_frontend_spec.md`

---

## 🛠 Tech Stack & Tools

- **Framework:** React 18+
- **Build Tool:** Vite (TypeScript)
- **UI Library:** Material UI (MUI) v6
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

- [ ] **Project Setup:** Initialize Vite + React + TypeScript.
- [ ] **Config:** Setup `tsconfig`, `eslint`, `prettier` (AirBnB or Google style).
- [ ] **Docker:** Create `Dockerfile` and update `docker-compose.yml`.
- [ ] **Proxy:** Configure Vite proxy to backend (`/api` -> `http://localhost:8080`).
- [ ] **FSD Structure:** Create directory structure.
- [ ] **Shared Layer:**
    - [ ] Setup Axios with `X-Trace-ID` interceptor.
    - [ ] Setup MUI Theme (Dark/Light mode support).

### Phase 2: Authentication (Auth Context)

- [ ] **Entities/User:** Define `User` type and `useAuth` store (Zustand).
- [ ] **Features/Auth:** Implement `LoginForm` component.
- [ ] **Pages/Login:** Create Login Page.
- [ ] **App/Router:** Protected Routes (Require Login).

### Phase 3: File Browser Core (File Context)

- [ ] **Entities/File:** Define `FileNode` type, `useFiles` (React Query).
- [ ] **Widgets/FileTable:**
    - [ ] Render List/Grid view.
    - [ ] Breadcrumb navigation.
    - [ ] File Icon integration.
- [ ] **Features/FileBrowser:**
    - [ ] Directory Navigation (Click to enter).
    - [ ] Path State Management.

### Phase 4: File Operations (Actions)

- [ ] **Features/FileActions:**
    - [ ] **Delete:** Multi-select + Delete confirmation modal.
    - [ ] **Move:** "Move to..." modal with folder picker.
    - [ ] **Upload:** Drag & Drop zone + Progress bar (Resumable upload stub).

### Phase 5: Admin & Observability

- [ ] **Pages/Admin:** Admin Dashboard layout.
- [ ] **Widgets/UserTable:** List/Add/Delete users.
- [ ] **Widgets/AuditLog:** View `audit_logs` table (Trace ID visualization).

### Phase 6: Polish

- [ ] **Responsive:** Mobile view optimization.
- [ ] **Error Handling:** Toast notifications (Snackbar) for API errors.
