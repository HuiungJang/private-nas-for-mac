# Plan 78 - Issue #158 Action Bar Hierarchy

## Objective
Make the file action bar hierarchy clearer: primary upload action, secondary structure/actions, and clearer selected-item action grouping.

## Scope
- Update `FileActionsToolbar` visual hierarchy and grouping only.
- Keep behavior unchanged.

## Tasks
1. Promote Upload as primary CTA.
2. Keep New Folder as secondary and Refresh as tertiary.
3. Group selection-only actions (Move/Delete) behind a divider + compact count context.
4. Ensure mobile icon actions remain usable with consistent emphasis.

## Validation
- `npm run build`
- `npx vitest run`

## Out of scope
- New backend APIs
- Changes to file operations semantics
