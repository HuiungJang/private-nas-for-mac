# Private NAS for Mac 🍎🔒

**A secure, self-hosted personal cloud solution for macOS, built with "Vibe Coding".**

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
* **Robust Backend:** Powered by Java Spring Boot 3.x with Domain-Driven Design (DDD).
* **Admin Dashboard:** Comprehensive monitoring of system health, user management, and access logs.

---

## 🧘 Vibe Coding Project

This project is being developed using **Vibe Coding** methodologies.
> *It's not just about writing code; it's about the flow, the intuition, and the seamless
collaboration between human intent and AI execution.*

We are leveraging "Gemini" agents to iterate rapidly on specifications, architecture, and
implementation, focusing on "feeling" the right solution before committing to the syntax.

---

## 🛠 Tech Stack

* **Backend:** Java 21, Spring Boot 3.x, Spring Security, JPA/Hibernate
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

---

## 🚀 Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your Mac.

### Step 1: Configure Environment
1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and configure required security values:
   - `APP_SECURITY_BOOTSTRAP_ADMIN_PASSWORD` (initial admin password)
   - `JWT_SECRET` (Base64, decoded length >= 32 bytes)
   - `WG_HOST` (Public IP or DDNS)
   - `WG_PASSWORD_HASH` (wg-easy admin password hash)
   - `TRUSTED_PROXY_SUBNETS` (X-Forwarded-For를 신뢰할 프록시 CIDR 목록)

   Trusted Proxy 설정 예시:
   - 로컬 단독: `127.0.0.1/32,::1/128`
   - 단일 리버스 프록시: `<proxy-ip>/32`
   - 금지 권장: `0.0.0.0/0`, `::/0` (모든 IP 신뢰)

   Generate a secure JWT secret:
   ```bash
   openssl rand -base64 32
   ```

### Step 2: Start Services (with preflight checks)
Run the startup script (recommended):
```bash
./start.sh
```

Or run Docker directly:
```bash
docker-compose up -d
```

### Backend Profile Notes
- Production-safe defaults are in `application.yml` (SQL logs off).
- For local debugging with SQL logs enabled, use dev profile:
```bash
SPRING_PROFILES_ACTIVE=dev
```

### Step 3: Connect
1. Access the Admin UI at [http://localhost:51821](http://localhost:51821).
2. Login with the password you set in `.env`.
3. Create a new client (peer).
4. Scan the QR code with the WireGuard mobile app or download the configuration for your laptop.

### Step 4: Network Setup
- On your home router, **forward UDP port 51820** to your Mac's local IP address.

---
*© 2026 Private NAS Project. Created with Vibe.*
