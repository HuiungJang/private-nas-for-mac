# Issue #132 Plan — Advanced Multi-Select UX

## Scope (minimal complete)
- Add DSM-like range select with Shift key.
- Add toggle select with Cmd/Ctrl key.
- Keep clear visual selected state in table/grid.
- Add selected-state action/info bar with quick actions.

## Implementation steps
1. Extend `FileTable` with selection intent callback carrying modifier keys + index.
2. Implement selection policy in `FileBrowser`:
   - Plain click: single-select
   - Cmd/Ctrl: toggle target row
   - Shift: range-add from anchor
3. Add selected action/info bar under filters with `Select All Visible` and `Clear`.
4. Validate build.

## Validation
- `npm run build` (frontend)

## Out of scope
- Keyboard-only multi-select and marquee select.
