# Engineering Guide

This document defines what I want to learn through this project.

## Core Learning Goals

- TypeScript domain modeling
- Testing: unit, integration, Playwright E2E
- GitHub workflow: branch, commit, PR, review
- REST API design
- Node.js server flow
- OpenAPI documentation when API stabilizes
- Notion export integration
- Figma/FigJam export integration
- Later: AWS persistence and observability

## REST API Learning Goal

REST should be learned through actual product needs:

- save a graph
- load a graph
- update a graph
- delete a graph
- export a learning session

Do not build API before local ConceptGraph and URL sharing are working.

## Node.js Learning Goal

Use backend work to understand:

- request lifecycle
- route/controller/service/repository separation
- validation
- error handling
- logging
- integration tests

## Testing Learning Goal

Start with unit tests.

Only add Playwright when UI flows exist.

## Code Organization Rule

Keep domain code small, explicit, and colocated by feature.

- Prefer feature directories such as `src/domain/conceptGraph` and `src/domain/importExport`.
- Keep domain types in that feature directory as `types.ts`.
- Do not create a global `src/types` directory until a type is truly cross-cutting and has no clear owner.
- Treat 200-250 lines as a review threshold, not a hard rule. If a file passes it, check whether it still has one clear responsibility.
- Keep `src/domain` free of React, browser APIs, storage, network, and UI state.
- Put public format adapters at the edge, for example nested JSON import/export around internal `ConceptGraph`.

## UI Boundary Rule

React components may orchestrate domain functions, but should not become the domain model.

- Keep transient form state local to the component that owns the form.
- Move repeated or independently testable UI regions into named components.
- Keep URL, localStorage, clipboard, and future canvas/store integrations as adapters around `ConceptGraph`.
- Do not add a global store until state is shared across independent surfaces such as a canvas renderer, inspector, keyboard shortcuts, and persistence adapters.

## GraphEditor Split Plan

`GraphEditor.tsx` is allowed to be the first integration point for MVP work, but it should not keep absorbing every editor feature.

Before adding Pixi.js or file drag-and-drop import, split it into smaller UI pieces:

- `GraphToolbar`
- `TreeJsonPanel`
- `ReviewStrip`
- `NodeTree`
- `NodeInspector`

Keep graph mutation commands, history, URL state, and persistence orchestration in the top-level editor until a store is justified.

## AI-Assisted Development Rule

Use AI to speed up implementation, but keep the workflow explicit.

- Start each task with scope, out-of-scope, and acceptance criteria.
- Read the existing code before changing it.
- Reuse existing domain adapters before adding new ones.
- Review the diff for bugs, regressions, missing tests, and structural drift.
- Put useful follow-up ideas into GitHub issues instead of expanding the current PR.

## CI Tooling Rule

Use `package.json#packageManager` as the single source of truth for pnpm.

CI should enable Corepack and let pnpm resolve from that field. Do not duplicate the pnpm version in GitHub Actions workflow configuration.

CI should run the same minimum verification expected locally:

- `pnpm typecheck`
- `pnpm test`
- `pnpm build`
- `pnpm test:e2e` when UI flows are affected

## Notion Learning Goal

Notion is an export/archive target.

ConceptGraph remains the source of truth.

## Figma Learning Goal

Figma/FigJam is a visual export target.

Do not convert Pixi objects directly.

Use:
ConceptGraph -> Export DTO -> Figma adapter

## OpenAPI Rule

Use OpenAPI when API routes become stable.

Do not start with OpenAPI before the API shape exists.
