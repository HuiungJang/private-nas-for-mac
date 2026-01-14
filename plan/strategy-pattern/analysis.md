# Design Pattern Analysis for Directory Listing Refactoring

**Context:** Refactoring `LocalFileSystemAdapter.listDirectory` in the `Private NAS` project.
**Goal:** Improve Readability, Maintainability, and Performance using Modern Java (Java 25).

## Candidate Patterns

### 1. Chain of Responsibility (Pipeline)

Decompose the monolithic `listDirectory` method into a sequence of discrete processing steps (
Handlers).

* **Structure:** `Request` -> `SecurityCheck` -> `Validation` -> `Fetching` -> `Sorting` ->
  `Breadcrumbs` -> `Response`.
* **Modern Implementation:** Use a functional pipeline (e.g., `Function<Context, Context>`) or a
  declarative Stream-like flow.
* **Pros:** excellent separation of concerns. Each step is testable in isolation. The main method
  becomes a readable table of contents.
* **Cons:** Can create object overhead if not careful.

### 2. Strategy Pattern

Encapsulate the listing algorithm into interchangeable strategies.

* **Structure:** `ListingContext` has a `ListingStrategy`. Strategies: `StandardListing`,
  `RecursiveListing`, `SearchListing`.
* **Pros:** Great for future expansion (e.g., adding Search).
* **Cons:** Doesn't necessarily clean up the *internal* logic of the "Standard" listing (which is
  where the mess is now).

### 3. Template Method Pattern

Define the skeleton of the algorithm in a base class, deferring specific steps to subclasses.

* **Structure:** `AbstractDirectoryLister` implements `list()` calling `validate()`, `fetch()`,
  `postProcess()`.
* **Pros:** Enforces structure.
* **Cons:** Rigid inheritance hierarchy. Harder to unit test individual steps without subclassing.

## Scoring

| Pattern                     | Readability (Max 10) | Maintainability (Max 10) | Performance (Max 10) | **Total** |
|:----------------------------|:--------------------:|:------------------------:|:--------------------:|:---------:|
| **Chain of Responsibility** |        **10**        |          **9**           |          8           |  **27**   |
| Strategy                    |          8           |            9             |          8           |    25     |
| Template Method             |          7           |            6             |        **9**         |    22     |

**Scoring Logic:**

* **Readability:** CoR wins because the main flow reads like English: "Validate, then List, then
  Sort".
* **Maintainability:** CoR allows adding new steps (e.g., "Thumbnail Generation Trigger") without
  touching other steps.
* **Performance:** Template Method is fastest (direct calls), CoR has slight overhead (object
  wrapping/functional calls), but negligible in IO-bound operations.

## Selected Pattern: Chain of Responsibility (Functional Pipeline)

We will implement a lightweight, functional variation of the Chain of Responsibility pattern.
Instead of heavy classes for each step, we will use small, focused components or functions
orchestrated by a Pipeline.

### Implementation Plan

1. **Extract Logic:** Break `listDirectory` into:
    * `PathValidator` (Security & Existence)
    * `FileFetcher` (NIO interaction)
    * `FileSorter` (Domain logic)
    * `BreadcrumbGenerator` (Domain logic)
2. **Refactor Adapter:** `LocalFileSystemAdapter` will orchestrate these components.
3. **Modern Java Features:**
    * `Stream` API for listing.
    * `Comparator` chaining.
    * `record` for intermediate data carriers if needed.
    * `Optional` for null safety.
