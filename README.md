# Private NAS for Mac 🍎🔒

**A secure, self-hosted personal cloud solution for macOS, built with OpenClaw + Codex AI-assisted development.**

![Status](https://img.shields.io/badge/Status-In%20Development-orange)
![Tech](https://img.shields.io/badge/Stack-Java%20Spring%20Boot%20%7C%20React%20%7C%20Docker-blue)
![Security](https://img.shields.io/badge/Security-VPN%20Only-green)

---

## 📖 Project Overview


**Private NAS for Mac** is a custom-built Network Attached Storage (NAS) software designed to turn
your Mac (and its connected external drives) into a secure personal cloud. It aims to replace
commercial services like Google Drive or Dropbox by providing a user-friendly web interface for file
management, all while keeping your data physically in your control.

Unlike typical cloud services exposed to the public internet, this project adopts a **VPN-First
Security Model**, ensuring your data is accessible only through a secure, private tunnel.

### ✨ Key Features

* **VPN-Gated Access:** The web interface is hidden from the public internet. Access is strictly
  controlled via WireGuard VPN.
* **Mac-Native:** Optimized for macOS file systems (APFS) and external volume handling (`/Volumes`).
* **Modern Web UI:** A responsive, drag-and-drop file manager built with React and Material UI.
* **Robust Backend:** Powered by Java Spring Boot 4.x with Domain-Driven Design (DDD).
* **Admin Dashboard:** Comprehensive monitoring of system health, user management, and access logs.

---

## 🧘 AI-Assisted Development Workflow

This project is developed with an AI-assisted workflow focused on fast iteration and tight feedback loops.

We use **OpenClaw** as the orchestration layer and **Codex agents/models** for implementation,
review, and refactoring across specs, architecture, backend, frontend, and operations.

---

## 🛠 Tech Stack

* **Backend:** Java 25, Spring Boot 4.x, Spring Security, JPA/Hibernate
* **Frontend:** TypeScript, React, Vite, Material UI (MUI), Zustand
* **Infrastructure:** Docker, Docker Compose, WireGuard (VPN), PostgreSQL
* **Architecture:** Hexagonal Architecture (Ports & Adapters)

---

## 📂 Documentation

Detailed specifications and architectural decisions can be found in the `spec/` directory:

* [**Master Specification**](./spec/00_master_spec.md): The high-level goals and roadmap.
* [**Technical Architecture**](./spec/01_technical_architecture.md): System design, container
  diagrams, and module structure.
* [**VPN Implementation**](./spec/02_vpn_implementation.md): Details on the security model and
  networking.
* [**Admin Page Spec**](./spec/page/admin/): UI/UX and API specs for the administration interface.
* [**VPN Operations Runbook**](./docs/vpn_operations_runbook.md): Key rotation, revoke, upgrade/rollback checklist.

---

## 🚀 Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your Mac.

### Step 1: Configure Environment
> ⚠️ If `config/db-data` already exists, changing `NAS_USER/NAS_PASSWORD/NAS_DB` later may cause backend DB authentication failures. Reinitialize DB data (after backup) or keep credentials aligned with the existing DB.

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and configure required security values:
   - `APP_SECURITY_BOOTSTRAP_ADMIN_PASSWORD` (initial admin password)
   - `JWT_SECRET` (Base64, decoded length >= 32 bytes)
   - `WG_HOST` (Public IP or DDNS)
   - `WG_EASY_VERSION` (pinned wg-easy image version)
   - `WG_PASSWORD_HASH` (wg-easy admin password hash)
   - `NAS_USER`, `NAS_PASSWORD`, `NAS_DB` (PostgreSQL credentials)
   - `TRUSTED_PROXY_SUBNETS` (X-Forwarded-For를 신뢰할 프록시 CIDR 목록)
   - `FRONTEND_BIND_ADDRESS` (frontend host bind address, secure default: `127.0.0.1`)

   Trusted Proxy 설정 예시:
   - 로컬 단독: `127.0.0.1/32,::1/128`
   - 단일 리버스 프록시: `<proxy-ip>/32`
   - 금지 권장: `0.0.0.0/0`, `::/0` (모든 IP 신뢰)

   VPN allowed subnets 기본값에는 IPv6 loopback(`::1/128`)이 포함됩니다.

   CORS 보안 가드:
   - `allowCredentials=true` 구성에서는 `CORS_ALLOWED_ORIGINS`에 wildcard(`*`, `http://*`, `https://*`)를 사용할 수 없습니다.

   Generate a secure JWT secret:
   ```bash
   openssl rand -base64 32
   ```

### Step 2: Start Services (with preflight checks)
Run the startup script (recommended):
```bash
./start.sh
```

Or run Docker directly (recommended with rebuild to avoid stale images):
```bash
docker-compose up -d --build
```

### Health Check & Monitoring Quick Check
```bash
docker-compose ps
docker-compose logs --tail=100 nas-db nas-backend nas-frontend
```
- `nas-db`: `pg_isready` 기반 healthy
- `nas-backend`: `GET /actuator/health` 상태 기반 healthy (IPv4 loopback 127.0.0.1 고정)
- `nas-frontend`: nginx index 응답 기반 healthy
- If Dockerfile/healthcheck was changed, run with `--build` to avoid stale image mismatch.

Audit logs API pagination example:
```bash
curl -H "Authorization: Bearer <token>" "http://127.0.0.1/api/admin/system/audit-logs?offset=0&limit=100"
```
(`limit` max 500)

### Local Smoke E2E
```bash
bash scripts/smoke_e2e.sh
```
This script builds/starts containers, validates core auth/health paths, and then checks discovered backend API routes for safe-method(GET) non-404/non-5xx reachability.

### CI Quality Gates
- Pull Request / Push(main):
  - backend `./gradlew test`
  - frontend `npm ci && npm run build`
  - frontend production dependency audit `npm audit --omit=dev --audit-level=high`
- Push(main):
  - `bash scripts/smoke_e2e.sh`

### Backend Profile Notes
- Production-safe defaults are in `application.yml` (SQL logs off).
- For local debugging with SQL logs enabled, use dev profile:
```bash
SPRING_PROFILES_ACTIVE=dev
```
- If needed, override preview cache directory explicitly:
```bash
APP_STORAGE_CACHE_DIR=/tmp/nas-cache
```

### Backend Build Performance Notes
- Gradle configuration cache is enabled in `backend/gradle.properties`.
- First build warms cache; repeated runs are faster.

### Step 3: Connect
1. Access the Admin UI at [http://localhost:51821](http://localhost:51821).
2. Login with the password you set in `.env`.
   - Frontend auth token is stored in sessionStorage, so closing the browser requires login again.
3. Create a new client (peer).
4. Scan the QR code with the WireGuard mobile app or download the configuration for your laptop.

### Step 4: Network Setup
- On your home router, **forward UDP port 51820** to your Mac's local IP address.
- Do **not** forward port 80 publicly unless you explicitly intend to expose the frontend.
- Keep `FRONTEND_BIND_ADDRESS=127.0.0.1` by default for safer local-only bind.
- Keep `WG_EASY_VERSION` pinned. Upgrade by explicitly changing version, reviewing changelog, then redeploying.

---
*© 2026 Private NAS Project. Created with Vibe.*
