# Private NAS for Mac - Developer Context (`GEMINI.md`)

This file provides the necessary context for an AI agent to understand, build, and extend the "
Private NAS" project.

## 1. Project Overview

**Private NAS** is a self-hosted, secure cloud solution designed for macOS. It exposes a web
interface for file management *only* via a secure VPN tunnel (WireGuard).

- **Core Philosophy:** "VPN-First Security" & "Vibe Coding" (Iterative, AI-assisted development).
- **Current Status:** Phase 1 (Foundation & Architecture). Backend scaffolding is in place; Frontend
  is **not yet created**.
- **Target OS:** macOS (Host), running services in Docker.

## 2. Technology Stack

### Backend (`/backend`)

* **Language:** Java 25 (Preview features enabled).
* **Framework:** Spring Boot 4.0.1 (Experimental/Future version).
* **Build Tool:** Gradle (Kotlin DSL `build.gradle.kts`).
* **Architecture:** **Hexagonal Architecture (Ports & Adapters)** + Domain-Driven Design (DDD).
* **Key Libraries:**
    * `spring-boot-starter-webmvc`
    * `spring-boot-starter-security`
    * `spring-boot-starter-data-jdbc` (Note: Specs mention JPA, but Gradle uses JDBC currently).
    * `lombok`

### Infrastructure

* **Containerization:** Docker & Docker Compose (`docker-compose.yml`).
* **VPN:** WireGuard (`ghcr.io/wg-easy/wg-easy`).
* **Database:** PostgreSQL (Container `nas-db` expected, dependencies included).

### Frontend (Not yet implemented)

* *Planned:* React, TypeScript, Vite, Material UI.

## 3. Architecture & Conventions

### 3.1 Hexagonal Architecture (Ports & Adapters)

The backend is strictly structured by **Bounded Contexts** (e.g., `auth`, `file`, `system`).

**Standard Package Structure:**

```text
com.manas.backend.context.{context_name}
├── domain/             # Core Business Logic (Entities, POJOs). NO Framework dependencies.
├── application/        # Application Logic (Use Cases).
│   ├── port/           # Interfaces.
│   │   ├── in/         # Primary Ports (Use Cases implemented by Service).
│   │   └── out/        # Secondary Ports (Interfaces for Adapters).
│   └── service/        # Implementation of Input Ports (Business Logic).
└── infrastructure/     # Framework implementations.
    ├── web/            # Input Adapters (Controllers, DTOs).
    ├── fs/             # Output Adapters (File System).
    └── persistence/    # Output Adapters (Database).
```

### 3.2 Coding Rules

1. **Dependency Rule:** Domain layer depends on NOTHING. Application layer depends ONLY on Domain.
   Infrastructure depends on everything.
2. **Mapping:**
    * **Strictly separate models:** `DTO` (Web) ≠ `Domain Object` (App/Domain) ≠ `Entity` (DB).
    * Use **MapStruct** (or manual mappers for now) to convert between layers.
    * *Do not leak Infrastructure objects (like JPA Entities) into the Domain or Web layers.*
3. **File System:**
    * Use `java.nio` for file operations.
    * Be aware of macOS specific paths (`/Volumes/...`).
4. **Security:**
    * Assume all requests come from behind a VPN.
    * Future: Implement JWT for user session management.
5. **Testing Mandatory:**
    * All new features or refactoring MUST include corresponding Unit Tests (Domain/Service) and
      Integration Tests (Infrastructure/Controller).
    * Code without tests is not acceptable.

## 4. Development & Build

### Prerequisites

* Java 25 (or compatible JDK).
* Docker & Docker Compose.

### Commands

* **Build Backend:** `./gradlew clean build -p backend`
* **Run Tests:** `./gradlew test -p backend`
* **Run Locally (Dev):** `./gradlew bootRun -p backend`
* **Start Infrastructure:** `docker-compose up -d`

## 5. Current State & Known Issues

* **Frontend Missing:** The `frontend` directory does not exist. It needs to be initialized (
  React/Vite).
* **Data Access Discrepancy:** `build.gradle.kts` uses `spring-boot-starter-data-jdbc`, but
  architectural specs (`spec/01_technical_architecture.md`) mention JPA/Hibernate. *Clarify with
  user before implementing complex persistence.*
* **Status:** "List Directory" feature is partially implemented. Next steps are Database integration
  and Security.

## 6. Key Documentation

* `spec/00_master_spec.md`: High-level goals.
* `spec/01_technical_architecture.md`: Detailed module breakdown.
* `TODO.md`: Immediate roadmap.
