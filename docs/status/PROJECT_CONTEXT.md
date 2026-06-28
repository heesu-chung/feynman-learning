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
- local Graph Editor
- localStorage persistence
- URL graph sharing
- explanation quality score editing
- weak-node visual states
- GitHub Actions CI
- Figma-inspired black-and-white plus pastel design direction
- default AI task protocol in `AGENTS.md`
- issue-style task feedback in final responses
- branch-first workflow for future implementation work

## Current Architecture Rule

ConceptGraph is the source of truth.

UI, URL state, storage, Pixi, REST API, Notion, Figma, AWS, and OpenAI must stay as adapters around the domain model.

## Current Validation

Expected commands:

```bash
pnpm typecheck
pnpm test
pnpm build
```

## Current Next Safe Task

Add a simple review flow for weak nodes.

## Current Workflow

Future implementation work should use task branches and PR-ready summaries.

Level 1-2 tasks may be implemented, validated, committed, and pushed automatically to the task branch.

Do not merge task branches into `main` automatically.

## Do Not Start Yet

- Pixi renderer
- REST API
- Notion/Figma export
- AWS
- OpenAI API
