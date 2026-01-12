# Plan: File Upload Implementation

## 1. Goal

Implement the **File Upload** feature (`POST /api/files/upload`) for the Private NAS backend.
This enables authenticated users (VPN only) to upload files to a specific directory within the
storage root.

## 2. Context & Requirements

- **Module:** `backend/context/file`
- **Architecture:** Hexagonal (Port/Adapter)
- **Input:** Multipart File, Target Directory Path.
- **Output:** Success/Failure status, Metadata of created file.
- **Constraints:**
    - Secure (Path Traversal protection).
    - Efficient (Streaming for large files).
    - Audit Logging (Trace ID integration).
    - Strict TDD (Test First).

## 3. Design Pattern Evaluation

We need to handle the upload logic, specifically **Validation** (Size, Ext) and **Conflict
Resolution** (Overwrite, Rename).

| Pattern                     | Application Strategy                                                                                          | Readability (0-10)   | Performance (0-10) | Maintainability (0-10)     | Total           |
|:----------------------------|:--------------------------------------------------------------------------------------------------------------|:---------------------|:-------------------|:---------------------------|:----------------|
| **Chain of Responsibility** | Use for **Validation**. Create a chain of validators (`SizeValidator` -> `NameValidator` -> `PathValidator`). | 9 (Clear separation) | 9 (Fast fail)      | 10 (Easy to add new rules) | **28** (Winner) |
| **Strategy**                | Use for **Conflict Resolution**. `FileCollisionStrategy` (`Overwrite`, `Rename`, `Reject`).                   | 8 (Clear intent)     | 10 (Zero cost)     | 9 (Easy swap)              | 27              |
| **Template Method**         | Use for the `upload` method skeleton. `validate()` -> `save()` -> `audit()`.                                  | 7 (Rigid structure)  | 9                  | 8                          | 24              |

**Decision:** We will apply the **Chain of Responsibility** pattern conceptually for the validation
logic (even if implemented simply as a list of checks for now) and keep **Strategy** in mind for
future collision handling (defaulting to "Reject" or "Rename" for now). For this implementation, we
will prioritize a clean Service layer that orchestrates these steps clearly.

## 4. Risk Analysis

| Risk                | Impact                 | Mitigation                                                                                                                                                     |
|:--------------------|:-----------------------|:---------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Path Traversal**  | High (Security Breach) | Reuse existing `resolveTarget` method in Adapter which already has strict checks.                                                                              |
| **Memory Overflow** | High (Server Crash)    | **Crucial:** Use `InputStream` and `Files.copy` for streaming. Never load full file into byte array.                                                           |
| **Disk Exhaustion** | Medium (Service Down)  | Check available disk space before writing (Future: Quota).                                                                                                     |
| **Partial Writes**  | Medium (Corrupt Files) | Write to a temp file first, then atomic move (optional for V1, but good practice). For V1, we will write directly but handle exceptions by attempting cleanup. |

## 5. Implementation Steps (TDD & Sequential)

### Step 1: Define Interfaces (Port Layer)

- **Action:** Update `FileStoragePort` to include
  `void save(InputStream content, String logicalPath)`.
- **Test:** None (Interface definition).

### Step 2: Implement Infrastructure (Adapter Layer)

- **Action:** Implement `save` in `LocalFileSystemAdapter`.
- **Logic:** Resolve path -> Check existence (prevent overwrite for now) ->
  `Files.copy(stream, path)`.
- **Test:** `LocalFileSystemAdapterTest` (Integration).
    - *Case 1:* Save valid file.
    - *Case 2:* Save to invalid path (traversal).
    - *Case 3:* Save existing file (throw conflict).

### Step 3: Define Domain Command & Validation

- **Action:** Create `FileUploadCommand` (Record) and `FileValidator` (Domain Service).
- **Test:** `FileValidatorTest`.
    - *Case:* Validate filename characters.

### Step 4: Implement Application Service

- **Action:** Create `FileUploadService` (or add to `FileService`).
- **Logic:**
    1. Validate Command.
    2. Call Port -> `save`.
    3. Publish Event (Audit).
- **Test:** `FileUploadServiceTest` (Mocking Ports).

### Step 5: Implement Web Adapter (Controller)

- **Action:** Add `POST /api/files/upload` to `FileController`.
- **Logic:** Receive `MultipartFile`, convert to Command, call Service.
- **Test:** `FileControllerTest` (@WebMvcTest).
    - *Case:* Happy path.
    - *Case:* No file provided.

### Step 6: Verify & Refactor

- **Action:** Run all tests. Check Checkstyle/Linter. Ensure comments are present.

## 6. Verification Plan

- Run `./gradlew test -p backend` to ensure no regressions.
- Verify `LocalFileSystemAdapterTest` specifically.
