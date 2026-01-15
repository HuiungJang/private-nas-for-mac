# Plan: Implement User Listing API

## 1. Objective

Implement `GET /api/admin/users` to list all registered users.
Leverage Spring Boot 4 features (Virtual Threads) for performance.

## 2. Design Patterns & Features

- **Virtual Threads**: Enable for high-throughput I/O (Database access).
- **Hexagonal Architecture**: Strict separation of Web, Domain, and Persistence.
- **DTO Pattern**: `UserSummaryDto` to expose only necessary fields (exclude password hash).

## 3. Risks

- **N+1 Problem**: Fetching roles is eager, so it should be fine, but need to be careful if we add
  more relations.
- **Security**: Ensure only `ADMIN` role can access this endpoint.

## 4. Implementation Steps

### Step 1: Enable Virtual Threads

- Update `application.properties` to set `spring.threads.virtual.enabled=true`.

### Step 2: Define Ports & Domain Logic

- Create `LoadUsersPort` interface (Output).
- Create `ListUsersUseCase` interface (Input).
- Create `UserManagementService` implementing the use case.

### Step 3: Infrastructure (Persistence)

- Update `JpaUserRepositoryAdapter` to implement `LoadUsersPort`.

### Step 4: Infrastructure (Web)

- Create `AdminUserController`.
- Implement `GET /api/admin/users`.
- Use `MapStruct` or manual mapping for `User -> UserSummaryDto`.
- Secure endpoint with `@PreAuthorize("hasRole('ADMIN')")`.

### Step 5: Testing

- `UserManagementServiceTest` (Unit).
- `AdminUserControllerTest` (WebMvc/Standalone).

## 5. Verification

- Run tests.
- Check logs to confirm Virtual Threads usage (if possible, or just standard function).
