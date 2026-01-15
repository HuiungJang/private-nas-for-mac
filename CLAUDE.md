# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Project Overview

Private NAS for Mac is a self-hosted personal cloud storage solution with VPN-first security (
WireGuard). The application is only accessible through a secure VPN tunnel, never exposed to the
public internet.

## Build & Run Commands

### Backend (Java/Gradle)

```bash
./gradlew clean build -p backend     # Build
./gradlew test -p backend            # Run all tests
./gradlew test --tests "*FileUpload*" -p backend  # Run specific test
./gradlew bootRun -p backend         # Run locally (requires PostgreSQL)
```

### Frontend (React/Vite)

```bash
cd frontend
npm install                          # Install dependencies
npm run dev                          # Dev server (localhost:5173, proxies /api to :8080)
npm run build                        # Production build
npm run lint                         # ESLint + Prettier
npm run test                         # Vitest (add to package.json if missing)
```

### Full Stack (Docker)

```bash
cp .env.example .env                 # Set WG_HOST, WG_PASSWORD
docker-compose up -d                 # Start all services
```

## Architecture

### Backend: Hexagonal Architecture + DDD

Strictly structured by Bounded Contexts with clear layer separation:

```
com.manas.backend.context.{context}/
├── domain/           # Pure business logic, NO framework dependencies
├── application/
│   ├── port/in/      # Input ports (use cases)
│   ├── port/out/     # Output ports (interfaces for adapters)
│   └── service/      # Use case implementations
└── infrastructure/
    ├── web/          # Controllers, DTOs
    ├── persistence/  # JPA repositories
    └── fs/           # File system adapters
```

**Dependency Rule:** Domain → Application → Infrastructure (unidirectional only)

**Bounded Contexts:**

- `auth` - Authentication, JWT, user management
- `file` - Upload, download, preview, delete, move operations
- `system` - Audit logging

### Frontend: Feature-Sliced Design (FSD)

```
src/
├── app/              # Providers, root component
├── entities/         # Domain models, API hooks (file/, user/)
├── features/         # User interactions (auth/)
├── pages/            # Route pages (login/, dashboard/)
├── shared/           # Reusable: api/, ui/, lib/
└── widgets/          # Composite components (file-table/)
```

**State Management:**

- Zustand for client state (auth)
- TanStack Query for server state (files, users)

**UI:** Material UI v7 with iOS 17 aesthetic (frosted glass, translucency)

## Key Technologies

| Layer          | Stack                                                                              |
|----------------|------------------------------------------------------------------------------------|
| Backend        | Java 25, Spring Boot 4.0.1, Spring Security, JPA/Hibernate, Flyway                 |
| Frontend       | TypeScript 5.9, React 19, Vite (rolldown-vite), MUI 7, Zustand 5, TanStack Query 5 |
| Database       | PostgreSQL 16                                                                      |
| Infrastructure | Docker Compose, WireGuard VPN                                                      |

## Development Standards

### Mandatory Testing

- Write tests before implementation (TDD)
- Domain layer tests are critical
- Integration tests for infrastructure layer

### Refactoring Process

1. Use sequential thinking tool (minimum 6 steps)
2. Evaluate 3 design patterns with scoring (readability, performance, maintainability - each 10
   points)
3. Save planning as markdown in `/plan` directory
4. Include risk analysis in each step

### Architecture Rules

- Never leak infrastructure objects (JPA entities, DTOs) into domain layer
- Use MapStruct for DTO ↔ Domain mapping
- Validate file paths for path traversal attacks (see `FileValidator.java`)
- All requests include X-Trace-ID correlation header

## Important Configuration Files

- `backend/src/main/resources/application.yml` - JWT secrets, VPN subnets, storage paths
- `backend/src/main/resources/db/migration/` - Flyway migrations
- `frontend/vite.config.ts` - API proxy configuration
- `docker-compose.yml` - Full stack orchestration

## Documentation

- `spec/` - Detailed specifications (architecture, VPN, page-specific APIs)
- `plan/` - Implementation plans with sequential thinking analysis
