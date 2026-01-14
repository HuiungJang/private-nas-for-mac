# Plan: File Download Implementation

## 1. Objective

Implement the `Download File` feature (`GET /api/files/download`) for the User File Operations
module.
This feature MUST support:

- **Resumable Downloads** (HTTP Range Headers).
- **Secure Access** (VPN + Authentication + Path Traversal Protection).
- **Audit Logging** (Track who downloaded what).

## 2. Design Patterns Evaluation

| Pattern             | Score (1-10) | Reasoning                                                                                                                                                                                                                                              |
|:--------------------|:-------------|:-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Adapter Pattern** | 10/10        | **Mandatory** for Hexagonal Architecture. We must adapt the `LocalFileSystemAdapter` (Infrastructure) to the `FileStoragePort` (Domain) to return a framework-agnostic `FileContent` object.                                                           |
| **Template Method** | 9/10         | Good for the Service Layer (`DownloadFileService`). It defines the algorithm skeleton: `Validate Request` -> `Audit Log` -> `Retrieve Content`. Subclasses (if any) could override specific steps, but here it ensures the Audit step is never missed. |
| **Builder Pattern** | 8/10         | Useful for constructing the complex `ResponseEntity` in the Controller, setting Headers (`Content-Disposition`, `Content-Type`, `Content-Length`) and Status cleanly.                                                                                  |

**Selected Approach:**

- **Core Architecture:** Hexagonal (Adapter Pattern).
- **Service Logic:** Standard Service implementing UseCase (Implicit Template).
- **Response Construction:** Spring's `ResponseEntity.ok().headers()...` (Builder-style).

## 3. Risk Analysis

| Risk                  | Impact              | Mitigation                                                                                                                                                                         |
|:----------------------|:--------------------|:-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Path Traversal**    | Critical (Security) | Use existing `resolveTarget` method in `LocalFileSystemAdapter` which strictly validates paths against the root directory.                                                         |
| **Memory Exhaustion** | High (Stability)    | Use `InputStream` and `InputStreamResource`. **NEVER** load the entire file into a byte array. Stream directly from Disk to Network.                                               |
| **Partial Downloads** | Medium (UX)         | Ensure the `Content-Length` and `Accept-Ranges` headers are set correctly. Spring MVC's `Resource` support handles basic Range requests, but we must provide the correct metadata. |
| **Concurrent Access** | Low                 | File System handles read locks. Linux/Mac allows concurrent reads.                                                                                                                 |

## 4. Implementation Steps (Sequential Thinking)

### Step 1: Domain Layer Definitions

- **Goal:** Define the data structure for file content without binding to `java.io.File`.
- **Action:**
    - Create `FileContent` class in `domain` package.
        - Fields: `InputStream stream`, `long size`, `String name`, `String contentType`.
    - Update `FileStoragePort` interface.
        - Add `FileContent retrieve(String path, UUID userId)`.

### Step 2: Infrastructure Layer Implementation (Adapter)

- **Goal:** Implement the physical file retrieval.
- **Action:**
    - Modify `LocalFileSystemAdapter` to implement `retrieve`.
    - Logic:
        - `resolveTarget(path)` for security.
        - `Files.probeContentType(path)` for MIME type.
        - Return `FileContent` with `Files.newInputStream(path)`.

### Step 3: Application Layer (Service)

- **Goal:** Orchestrate the download and audit logging.
- **Action:**
    - Create `DownloadFileUseCase` interface (Input Port).
    - Create `DownloadFileService` class.
    - Logic:
        - Call `FileStoragePort.retrieve()`.
        - **Async** call to `AuditLogService` (already exists?) or publish event.
        - Return `FileContent`.

### Step 4: Web Layer (Controller)

- **Goal:** Expose the HTTP Endpoint.
- **Action:**
    - Modify/Create `FileController`.
    - Endpoint: `GET /api/files/download`.
    - Logic:
        - `@RequestParam String path`.
        - Call Service.
        - Construct `ResponseEntity<Resource>`.
        - Set headers: `Content-Disposition: attachment; filename="..."`, `Content-Type`,
          `Content-Length`.

### Step 5: Domain & Service Testing (TDD)

- **Goal:** Verify logic isolation.
- **Action:**
    - `DownloadFileServiceTest`:
        - Mock Port.
        - Verify `retrieve` is called.
        - Verify Audit Log interaction.

### Step 6: Infrastructure & Integration Testing

- **Goal:** Verify real file system interaction.
- **Action:**
    - `LocalFileSystemAdapterTest`:
        - Create temp file.
        - Call `retrieve`.
        - Verify stream content and size.
    - `FileControllerTest`:
        - MockMVC request with `Range` header (optional, mainly just checking 200 OK and Headers).

## 5. Verification Plan

1. Run `DownloadFileServiceTest`.
2. Run `LocalFileSystemAdapterTest`.
3. Manual verification using `curl` with Range headers if possible, or just checking the response.
