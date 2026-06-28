# Project Context

## Current State

The project is a personal Feynman Learning OS.

The current app is a Next.js local ConceptGraph editor.

Implemented:
- ConceptGraph domain model
- LearningState
- graph validation
- TreePatch
- command/history with undo/redo
- nested learning tree JSON import/export adapters
- local Graph Editor
- Graph Editor nested JSON import/export UI
- localStorage persistence
- URL graph sharing
- explanation quality score editing
- weak-node visual states
- weak-node review flow
- Korean UI copy
- GitHub Actions CI
- GitHub issue and pull request templates
- PR template scope, architecture, follow-up, and e2e checklist
- local slash command definitions in `.codex/commands`
- Figma-inspired black-and-white plus pastel design direction
- default AI task protocol in `AGENTS.md`
- issue-style task feedback in final responses
- branch-first workflow for future implementation work
- GitHub Issue creation fallback rules for unauthenticated environments
- CI package manager version rule using `package.json#packageManager`
- e2e verification in CI for UI flows
- JSON file drag-and-drop import captured as follow-up issue #4

## Current Architecture Rule

ConceptGraph is the source of truth.

UI, URL state, storage, Pixi, REST API, Notion, Figma, AWS, and OpenAI must stay as adapters around the domain model.

## Current Validation

Expected commands:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

## Current Next Safe Task

Split `GraphEditor.tsx` into named UI components before adding more editor UI.

Recommended component boundary:

- `GraphToolbar`
- `TreeJsonPanel`
- `ReviewStrip`
- `NodeTree`
- `NodeInspector`

Keep top-level graph/history orchestration in `GraphEditor` until Pixi.js or another independent editing surface makes a store worthwhile.

## Follow-up Issues

- #4 JSON file drag-and-drop import support
- #6 GraphEditor component split

## Current Workflow

Future implementation work should use task branches and PR-ready summaries.

Level 1-2 tasks may be implemented, validated, committed, and pushed automatically to the task branch.

Do not merge task branches into `main` automatically unless explicitly requested.

## Do Not Start Yet

- Pixi renderer
- REST API
- Notion/Figma export
- AWS
- OpenAI API
