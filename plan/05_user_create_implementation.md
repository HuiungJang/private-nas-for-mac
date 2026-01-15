# Plan: Implement Create User API

## 1. Objective

Implement `POST /api/admin/users` to create a new user.

## 2. Design Patterns & Features

- **Hexagonal Architecture**: Use Command object for Input Port.
- **Password Encoding**: Use `PasswordEncoder` (Delegating) in Service Layer.
- **Java 25 Records**: Use Records for DTOs and Commands.
- **Validation**: Bean Validation (`@Valid`) on DTO.

## 3. Risks

- **Duplicate Username**: Must check for existence before saving.
- **Security**: Only ADMIN can access.

## 4. Implementation Steps

### Step 1: Define Ports & Domain Logic

- Create `CreateUserUseCase` (Input Port).
    - Method: `void createUser(CreateUserCommand command);`
- Create `CreateUserCommand` (Record).
- Create `SaveUserPort` (Output Port) - *Wait, `LoadUsersPort` and `LoadUserPort` exist. Maybe
  combine or add new Interface `CreateUserPort`? or just `SaveUserPort`.*
- Create `CheckUserExistsPort` (Output Port).

### Step 2: Infrastructure (Persistence)

- Update `JpaUserRepositoryAdapter` to implement `SaveUserPort` and `CheckUserExistsPort`.
- Use `userMapper` to convert Domain -> Entity.

### Step 3: Application Layer (Service)

- Update `UserManagementService`.
    - Inject `PasswordEncoder`.
    - Implement `createUser`:
        - Check existence.
        - Encode password.
        - Create User domain object.
        - Save.

### Step 4: Infrastructure (Web)

- Create `CreateUserRequest` (DTO).
- Update `AdminUserController`.
    - `POST` endpoint.
    - Map DTO -> Command.

### Step 5: Testing

- `UserManagementServiceTest`.
- `AdminUserControllerTest`.

## 5. Verification

- Run tests.
