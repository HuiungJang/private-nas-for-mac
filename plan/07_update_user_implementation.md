# Plan: Implement Update User API

## 1. Objective

Implement `PUT /api/admin/users/{userId}` to update user status (`active`) and roles.
This requires modifying the `User` domain and DB schema to support the `active` field.

## 2. Design Patterns & Features

- **Hexagonal Architecture**:
    - Update Domain: Add `active` field.
    - Command: `UpdateUserCommand`.
    - UseCase: `UpdateUserUseCase`.
- **Flyway**: Migration `V4__add_user_active_status.sql`.
- **DDD**: Ensure `User` domain remains immutable (Records).

## 3. Risks

- **Data Migration**: Existing users in DB need a default `active` value (true).
- **Validation**: Ensure at least one role exists.
- **Self-Lockout**: Prevent Admin from deactivating themselves (logic check).

## 4. Implementation Steps

### Step 1: Database Migration

- Create `V4__add_user_active_status.sql`: Add `active` BOOLEAN NOT NULL DEFAULT TRUE.

### Step 2: Domain Layer Update

- Update `User` record: Add `boolean active`.
- Update `UserEntity`: Add `boolean active`.
- Update `UserMapper`: Map new field.

### Step 3: Ports & Use Case

- Create `UpdateUserCommand` (id, active, roles).
- Create `UpdateUserUseCase`.
- Update `SaveUserPort` (already exists, but need to ensure it handles updates - JPA `save` does
  update if ID exists).
- Create `LoadUserPort` generic method `loadUserById(UUID id)`.

### Step 4: Infrastructure (Persistence)

- Update `JpaUserRepositoryAdapter`: Implement `loadUserById`.

### Step 5: Application Layer (Service)

- Update `UserManagementService`.
    - Implement `updateUser(UpdateUserCommand)`.
    - Logic:
        - Load user.
        - Validate (e.g., prevent deactivating self if requested).
        - Create new User object with updated fields.
        - Save.

### Step 6: Web Layer

- Create `UpdateUserRequest` DTO.
- Update `AdminUserController`.
    - Endpoint `PUT /api/admin/users/{userId}`.

### Step 7: Testing

- `UserManagementServiceTest` (Unit).
- `AdminUserControllerTest` (Web).

## 5. Verification

- Run tests.
