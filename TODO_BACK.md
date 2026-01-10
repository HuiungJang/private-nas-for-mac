# Project TODO List

**Based on:**

- `spec/00_master_spec.md`
- `spec/01_technical_architecture.md`
- `spec/page/admin/01_backend_spec.md`

---

## 🚀 Phase 1: Foundation & Architecture

### 1.1 Infrastructure & Setup

- [x] **Project Scaffolding:** Spring Boot 4.x with Gradle (Kotlin DSL).
- [x] **Directory Structure:** Domain-Driven Design (DDD) + Hexagonal Architecture.
- [x] **Docker Environment:**
    - [x] Verify `docker-compose.yml` includes PostgreSQL, VPN (WireGuard), Nginx.
    - [x] Ensure Volume mappings for `/Volumes` (Mac Host) to Container are correct.
- [x] **Database Integration:**
    - [x] Configure PostgreSQL in `application.properties`.
    - [x] Setup Flyway or Liquibase for schema migrations.

### 1.2 Technical Debt / Refactoring

- [x] **Mapper Implementation:**
    - [x] Integrate **MapStruct** (currently manual mapping in `AdminFileController`).
    - [x] Create Mapper interfaces for DTO <-> Domain transformations.
- [x] **Global Error Handling:**
    - [x] Implement `@ControllerAdvice` for unified error responses (RFC 7807).
    - [x] Handle `SecurityException` (Path Traversal) and `IllegalArgumentException`.
- [x] **Log Tracking Foundation:**
    - [x] Implement `TraceIdFilter` (MDC).
    - [x] Configure Logback for Trace ID output.

---

## 🛡️ Phase 2: Security & Authentication (`context/auth`)

### 2.1 Security Core

- [x] **Spring Security Config:**
    - [x] Stateless Session Policy.
    - [x] CSRF Configuration (Disable for API, enable if needed for browser).
    - [x] CORS Configuration.
- [x] **JWT Implementation:**
    - [x] Token Generation (Login) - Provider Implemented.
    - [x] Token Validation Filter.
- [x] **VPN/IP Enforcement:**
    - [x] Implement IP Filter Middleware (Trust `X-Forwarded-For`).
    - [x] Validate requests originate from VPN Subnet.

### 2.2 User Domain

- [x] **Entities:** `User`, `Role`, `Password` (VO).
- [x] **Persistence:** `UserRepository` (JPA) - *Implemented with PostgreSQL/Flyway*.
- [x] **Use Cases:**
    - [x] Login.
    - [x] Create User (Admin) - *via DataInitializer on startup*.
    - [ ] Password Reset.

---

## 📂 Phase 3: File Management (`context/file`)

### 3.1 Admin File Operations (`/api/admin/files`)

- [x] **List Directory:** `GET /api/admin/files/list`
    - [x] Domain: `FileNode`, `DirectoryListing`.
    - [x] Port/Adapter: `LocalFileSystemAdapter` (Java NIO).
    - [x] Security: Path traversal protection.
- [x] **Delete Files:** `POST /api/admin/files/delete`
    - [x] UseCase: Batch delete logic.
    - [x] Audit Log integration - *Async AuditLogService implemented*.
- [x] **Move Files:** `POST /api/admin/files/move`
    - [x] UseCase: Source -> Dest validation.

### 3.2 User File Operations

- [ ] **Upload File:** `POST /api/files/upload`
    - [ ] Chunked upload support.
    - [ ] Quota check.
- [ ] **Download File:** `GET /api/files/download`
    - [ ] Range header support (resumable).
- [ ] **Preview:**
    - [ ] Thumbnail generation service.

---

## ⚙️ Phase 4: System Administration (`context/system`)

### 4.1 User Management API

- [ ] `GET /api/admin/users`: List users + usage stats.
- [ ] `POST /api/admin/users`: Create new user.
- [ ] `PUT /api/admin/users/{userId}`: Update status/role.

### 4.2 System Settings

- [ ] `GET /api/admin/settings`: Retrieve config.
- [ ] `PUT /api/admin/settings/ip-access`: Update allowed IPs.
- [ ] `PUT /api/admin/settings/theme`: Update UI theme config.

### 4.3 Monitoring / Dashboard

- [ ] `GET /api/admin/system/health`:
    - [ ] CPU/RAM usage (Micrometer/Actuator).
    - [ ] Storage usage (Disk space).
- [x] **Audit Logging:**
    - [x] Intercept critical actions (Login, Delete, Settings Change) and save to DB.
    - [x] Integrate Trace ID.

---

## 🧪 Testing & Quality

- [ ] **Unit Tests:**
    - [x] `LocalFileSystemAdapterTest` (Infrastructure).
    - [ ] Service Layer Tests (Mocking Ports).
- [ ] **Integration Tests:**
    - [ ] Controller Tests (`MockMvc`).
    - [ ] Testcontainers for Repository Layer (PostgreSQL).
