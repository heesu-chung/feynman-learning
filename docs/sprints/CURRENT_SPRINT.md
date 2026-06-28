# Current Sprint

## Sprint: MVP Re-alignment and Editor Stabilization

Goal:
Return the product to the first MVP path: import structured learning content as nested JSON, convert it into the internal `ConceptGraph`, then view, edit, share, and export the tree.

## Completed

1. Define `ConceptGraph` domain model
2. Add graph validation
3. Add TreePatch command flow
4. Add command/history with undo/redo
5. Add URL hash encode/decode
6. Add nested JSON import/export adapters
7. Connect paste-based JSON import/export to the React editor UI
8. Add unit and e2e coverage for import/export flow

## Active Stabilization Work

1. Keep CI aligned with local validation:
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm build`
   - `pnpm test:e2e`
2. Keep PRs small with explicit scope, out-of-scope, validation, architecture impact, risk, and follow-up notes.
3. Split `GraphEditor.tsx` before adding more editor UI.

## Next Safe Tasks

1. Refactor `GraphEditor.tsx` into named UI components without changing behavior from issue #6.
2. Add JSON file drag-and-drop import from issue #4.
3. Start Pixi.js tree rendering after the editor component boundary is stable.

## Do Not Start Yet

- OpenAI API
- AWS save/load
- Notion/Figma export
- StudySession
- weak-node learning flow deepening
