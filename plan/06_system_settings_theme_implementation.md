# Plan: Implement System Settings API (Theme)

## 1. Objective

Implement `PUT /api/admin/settings/theme` to update UI theme configuration.
This allows the user to change the visual theme (e.g., Light/Dark mode, Primary Color).

## 2. Design Patterns & Features

- **Hexagonal Architecture**:
    - `SystemSetting` Domain Entity.
    - `UpdateSystemSettingUseCase` (Input Port).
    - `SaveSystemSettingPort` (Output Port).
- **Key-Value Storage**: Store settings as simple key-value pairs in the database.
    - `theme.mode` -> `dark`
    - `theme.color.primary` -> `#FF5733`
- **DTO**: `ThemeConfigDto` to handle the JSON request.

## 3. Risks

- **Validation**: Must ensure colors are valid hex codes, modes are valid enums.
- **Authorization**: Strictly `ADMIN` only.

## 4. Implementation Steps

### Step 1: Define Domain & Ports

- Create `SystemSetting` (Domain Record).
- Create `LoadSystemSettingPort` & `SaveSystemSettingPort` (Output).
- Create `UpdateThemeUseCase` (Input).

### Step 2: Infrastructure (Persistence)

- Create `SystemSettingEntity` (JPA Entity).
- Create `JpaSystemSettingRepository`.
- Create `JpaSystemSettingAdapter` implementing Ports.

### Step 3: Application Layer

- Create `SystemSettingsService`.
    - Implement `UpdateThemeUseCase`.
    - Logic: Save "theme.mode" and "theme.primaryColor".

### Step 4: Infrastructure (Web)

- Create `SystemSettingsController`.
- Endpoint `PUT /api/admin/settings/theme`.
- DTO `ThemeConfigDto`.

### Step 5: Testing

- Unit tests for Service & Controller.

## 5. Verification

- Run tests.
