# Issue #133 Plan — Complete Context Menu Actions

## Scope (minimal complete)
- Extend file context menu with: Open, Move, Copy, Rename, Delete, Share.
- Implement practical actions using existing capabilities.
- Add disabled states based on item type / selection state.

## Implementation
1. Add Move modal invocation from context menu.
2. Add Rename dialog and implement rename via move API (same folder, new name).
3. Add Delete action for focused item.
4. Add Copy (name) and Share (path) clipboard actions.
5. Keep Open only for directories; disable non-applicable actions.

## Validation
- `cd frontend && npm run build`

## Notes
- Backend has no dedicated copy/share endpoint, so this scope uses clipboard-based UX for Copy/Share.
