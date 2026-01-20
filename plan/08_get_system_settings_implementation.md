# Plan: Implement Get System Settings API

## 1. Objective

Implement `GET /api/admin/settings` to retrieve all system configurations (Theme, IP Access, etc.).
Currently, it will focus on retrieving the **Theme** configuration stored in Key-Value format.

## 2. Design Patterns & Features

- **Hexagonal Architecture**:
    - `LoadSystemSettingsPort` (Output Port) to fetch all settings.
    - `GetSystemSettingsUseCase` (Input Port).
- **Key-Value Aggregation**: The Service layer will be responsible for aggregating individual KV
  pairs into a structured DTO (`SystemSettingsResponse`).
- **Default Values**: If settings are missing in DB, the Service must provide sensible defaults.

## 3. Risks

- **Missing Keys**: Database might be empty initially. Service must handle `null` values gracefully.
- **Type Conversion**: Stored values are Strings. If we add boolean/int settings later, conversion
  logic is needed.

## 4. Implementation Steps

### Step 1: Define DTOs & Ports

- Create `SystemSettingsResponse` (DTO) containing `ThemeConfigDto`.
- Create `LoadSystemSettingsPort` (Output Interface).
    - `List<SystemSetting> loadAll()`.
- Create `GetSystemSettingsUseCase` (Input Interface).

### Step 2: Infrastructure (Persistence)

- Update `JpaSystemSettingAdapter`.
    - Implement `LoadSystemSettingsPort`.
    - Use `repository.findAll()`.

### Step 3: Application Layer (Service)

- Update `SystemSettingsService`.
    - Implement `GetSystemSettingsUseCase`.
    - Logic:
        - Fetch all settings -> Map<String, String>.
        - Construct `ThemeConfigDto` from map (with defaults).
        - Return `SystemSettingsResponse`.

### Step 4: Infrastructure (Web)

- Update `SystemSettingsController`.
    - Endpoint `GET /api/admin/settings`.

### Step 5: Testing

- Unit tests for Service (Default value logic).
- Unit tests for Controller.

## 5. Verification

- Run tests.
