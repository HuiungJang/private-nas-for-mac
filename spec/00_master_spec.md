# Private NAS for Mac - Master Specification

**Version:** 1.2.0
**Status:** Draft
**Last Updated:** 2026-01-10
**Updates:** Added End-to-End Log Tracking Requirement.

---

## 1. Project Overview
**Private NAS for Mac** is a self-hosted network-attached storage solution designed to run on macOS, utilizing external storage devices. It aims to provide a secure, user-friendly, and high-performance personal cloud experience similar to commercial Synology or QNAP systems but built with custom software.

### 1.1 Goals
- Replace commercial cloud storage (Google Drive, Dropbox) with a private solution.
- **Strict Security:** The NAS is accessible *only* via a secure VPN tunnel. No public HTTP/S ports are exposed.
- Provide a seamless file management experience on both Desktop and Mobile.
- **Full Observability:** Provide complete traceability of user actions from frontend to backend for
  security auditing.

---

## 2. Technical Stack & Architecture

### 2.1 Backend
- **Language:** Java 21 or 25 (Preview features enabled if necessary).
- **Framework:** Spring Boot 3.x/4.x.
- **Build Tool:** Gradle (preferred for flexibility) or Maven.
- **Database:** PostgreSQL.
- **File System Interaction:** Java NIO for managing Mac file systems (APFS/HFS+).

### 2.2 Frontend
- **Language:** TypeScript.
- **Framework:** React.js.
- **Build Tool:** Vite.
- **UI Library:** Material UI (MUI).
- **State Management:** TanStack Query (React Query) / Zustand.

### 2.3 Infrastructure & DevOps
- **Containerization:** Docker & Docker Compose.
- **OS Support:** macOS (Host), Linux (Container base).
- **CI/CD:** Local build scripts.
- **Testing:** JUnit 5, Mockito, Testcontainers (Backend), Jest/Vitest (Frontend).

---

## 3. Detailed Functional Requirements

### 3.1 Authentication & Security (Priority #1)
- **VPN Enforcement:**
  - The Application (Web UI/API) MUST NOT be exposed to the public internet.
  - Users must connect to the hosted VPN (WireGuard) to access the NAS.
- **Login System:** Secure session/JWT based authentication (Secondary layer inside VPN).
- **Encryption:**
  - VPN Tunnel provides the primary encryption layer.
  - Internal traffic (Nginx -> Backend) can be HTTP or self-signed HTTPS.

### 3.2 File Management (Core)
- **File Explorer UI:**
  - Tree view for directory navigation.
  - Grid and List views for files.
  - Breadcrumb navigation.
- **Operations:**
  - Upload (Chunked upload for large files).
  - Download (Resumable downloads).
  - Delete (Move to "Trash" before permanent deletion recommended).
  - Move/Copy files between folders.
  - Rename files/folders.
- **Preview:**
  - **Images:** JPG, PNG, GIF, WEBP, HEIC (Mac native support).
  - **Video:** MP4, MOV (Streamable in browser).
  - **Documents:** PDF, TXT, MD preview.

### 3.3 Admin Dashboard
- **User Management:** Create, Edit, Delete users; Reset passwords.
- **Access Logs:** View login history (IP, User Agent, Time, Success/Fail).
- **File Operations Log:** Audit trail of who uploaded/deleted what.
- **Storage Control:** View mounted external drives, total space, and used space.

### 3.4 Additional NAS Features (Expanded)
- **Share Links:**
  - Since access is VPN-only, "Public" links are technically "Internal" links.
  - Users receiving a link must also have VPN access.
- **Thumbnail Generation:** Background job to generate low-res thumbnails for fast UI loading.
- **Search:** Full-text search for filenames.
- **System Health:** CPU and RAM usage monitoring of the host/container.

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **Large Files:** Support uploads > 10GB.
- **Concurrency:** Handle multiple users streaming/uploading simultaneously.
- **Caching:** Browser-side caching for assets and thumbnails; Server-side caching for directory listings.

### 4.2 Usability
- **Responsive Design:** Fully functional on Mobile (iOS/Android) browsers.
- **Drag & Drop:** Support dragging files from OS to Browser.

### 4.3 Mac Specifics
- **Volume Handling:** Automatically detect or manually configure paths to `/Volumes/{ExternalDriveName}`.
- **Permissions:** Ensure the application has Full Disk Access (if running natively) or volume mount permissions (Docker).

---

## 5. Data Model (High Level)

### 5.1 Users
- `id`: UUID
- `username`: String
- `password_hash`: String (Must use BCrypt or Argon2)
- `role`: Enum (ADMIN, USER)
- `created_at`: Timestamp

### 5.2 Access Logs
- `id`: Long
- `user_id`: UUID
- `ip_address`: String
- `action`: Enum (LOGIN, UPLOAD, DELETE, VIEW)
- `target_resource`: String (Filename/Path)
- `timestamp`: Timestamp
- `status`: String (SUCCESS, FAILURE)

---

## 6. Observability & Logging (New)

### 6.1 End-to-End Tracing

- **Requirement:** Every user action must be traceable from the Frontend UI click to the Backend
  Database execution.
- **Implementation:**
  - **Frontend:** Generates a unique `Trace ID` (UUID) for every API request and sends it in the
    `X-Trace-ID` header.
  - **Backend:**
    - Intercepts `X-Trace-ID` via a Filter.
    - Adds the ID to the **MDC (Mapped Diagnostic Context)**.
    - Includes the ID in all log outputs (Console/File).
    - Returns the ID in the `X-Trace-ID` response header for debugging.

### 6.2 Audit Logging

- **Requirement:** Critical business actions must be persisted to the `audit_logs` table.
- **Scope:** Login, Upload, Download, Delete, Move, Rename, User Management.
- **Data:** User ID, Action Type, Resource Path, Trace ID, Timestamp, IP Address.

---

## 7. Implementation Phases

### Phase 1: Foundation
- Project scaffolding (Spring Boot + React).
- Docker Compose setup.
- Basic Authentication.
- Basic File Listing (Local storage).
- **Log Tracking Foundation (Trace ID Middleware).**

### Phase 2: Core File Operations
- Upload/Download logic.
- File manipulation (Delete, Rename, Move).
- Tree View UI.
- **Audit Logging Integration.**

### Phase 3: Security & Admin
- IP Filter middleware.
- Admin Dashboard.
- Access Logging.

### Phase 4: Polish & Advanced Features
- File Previews.
- Mobile Optimization.
- Test Coverage expansion to > 70%.
