# Plan: File Preview & Thumbnail Implementation

## 1. Objective

Implement the `Preview` feature (`GET /api/files/preview`) to support **Thumbnail Generation** for
the User File Operations module.
This feature MUST support:

- **On-demand generation** of thumbnails for images (JPG, PNG).
- **Caching** of generated thumbnails to avoid re-processing.
- **Secure Access** (VPN + Authentication + Path Traversal Protection).
- **Extensibility** for future file types (Video, PDF).

## 2. Design Patterns Evaluation

| Pattern                     | Score (1-10) | Reasoning                                                                                                                                                                                                     |
|:----------------------------|:-------------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Strategy Pattern**        | 10/10        | **Best Fit.** We need different logic for generating thumbnails based on file type (Image, Video, PDF). An `ImagePreviewStrategy` can handle JPG/PNG, while a `VideoPreviewStrategy` (future) can use FFmpeg. |
| **Chain of Responsibility** | 8/10         | Good for "Try to generate with A, then B". But Strategy is cleaner for known file types based on MIME type detection.                                                                                         |
| **Proxy Pattern**           | 7/10         | Could be used for "Virtual Proxy" to return a placeholder while generating, but HTTP is request/response. Async generation would require a different API design (polling/websocket).                          |

**Selected Approach:**

- **Core Architecture:** Hexagonal (Port/Adapter).
- **Pattern:** **Strategy Pattern** for the `ThumbnailGenerator`.
    - `PreviewStrategy` interface.
    - `ImagePreviewStrategy` implementation (using Thumbnailator).
    - `DefaultPreviewStrategy` (fallback).

## 3. Risk Analysis

| Risk                    | Impact   | Mitigation                                                                                                                                         |
|:------------------------|:---------|:---------------------------------------------------------------------------------------------------------------------------------------------------|
| **High CPU Usage**      | Medium   | Image resizing is CPU intensive. Limit concurrent thumbnail generations or use a semaphore/queue. For now, rely on Virtual Threads.                |
| **Disk Space Filling**  | Medium   | Cache directory could grow indefinitely. **Mitigation:** Future task: Implement a cache eviction policy (LRU) or cron job to clean old thumbnails. |
| **Unsupported Formats** | Low      | If `Thumbnailator` fails, fallback to a default "Generic File" icon or return the original if small.                                               |
| **Path Traversal**      | Critical | Use the existing secure `resolveTarget` for source files. Ensure cache paths are also sandboxed.                                                   |

## 4. Implementation Steps (Sequential Thinking)

### Step 1: Project Configuration

- **Action:**
    - Add `net.coobird:thumbnailator` dependency to `build.gradle.kts`.
    - Add `app.storage.cache-dir` to `application.properties`.

### Step 2: Domain Layer

- **Action:**
    - Create `PreviewType` enum (THUMBNAIL_SMALL, THUMBNAIL_LARGE).
    - Create `PreviewContent` record (similar to `FileContent`).
    - Create `PreviewGeneratorPort` interface.
        - `FileContent generate(FileContent source, int width, int height);`

### Step 3: Infrastructure Layer (Adapter)

- **Action:**
    - Implement `ThumbnailatorAdapter` (implements `PreviewGeneratorPort`).
    - Logic:
        - Check MIME type.
        - If image: Resize.
        - If other: Throw/Return null (Service handles fallback).

### Step 4: Application Layer (Service)

- **Action:**
    - Create `GetFilePreviewUseCase`.
    - Create `PreviewService`.
    - Logic:
        - `getPreview(path, userId)`
        - Calculate `cachePath` (hash of file path + mod time).
        - **Check Cache:** If exists, return cache.
        - **Miss:**
            - Retrieve original file via `FileStoragePort`.
            - Call `PreviewGeneratorPort`.
            - Save to `cachePath`.
            - Return result.

### Step 5: Web Layer (Controller)

- **Action:**
    - Modify `FileController`.
    - Endpoint: `GET /api/files/preview?path=...`
    - Returns image content.

### Step 6: Testing (TDD)

- **Action:**
    - `PreviewServiceTest`: Mock ports, verify cache logic.
    - `ThumbnailatorAdapterTest`: Verify resizing works on real image.

## 5. Verification Plan

1. Run `PreviewServiceTest`.
2. Run `ThumbnailatorAdapterTest`.
3. Manual: Upload an image, access `/api/files/preview?path=...`, verify resized image returned.
