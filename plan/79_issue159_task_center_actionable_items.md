# Plan 79 - Issue #159 Task Center Actionable Items

## Objective
Add actionable controls in Task Center: retry, dismiss, and details expansion.

## Scope
- `useTaskCenterStore`: task dismiss + lightweight retry hook.
- `TaskCenterPanel`: per-item action buttons and detail panel.

## Validation
- npm run build
- npx vitest run
