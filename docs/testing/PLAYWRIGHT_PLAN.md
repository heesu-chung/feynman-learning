# Playwright Plan

## Goal

Add browser-level confidence for the local ConceptGraph editor without moving ahead into backend or integration work.

## Scope

Initial Playwright coverage should focus on the current local-only learning loop:

- app loads the default ConceptGraph
- user can add a child concept
- user can edit concept title and explanation
- user can adjust explanation quality scores
- weak nodes are visually identifiable
- weak-node review flow can move through weak concepts
- graph state persists through localStorage reload
- graph state can be encoded in the URL and restored from that URL

## Out of Scope

- REST API flows
- Notion export
- Figma export
- AWS deployment checks
- OpenAI-assisted workflows
- Pixi renderer behavior

## Dependency Plan

Playwright is not installed yet.

Before implementation, request approval to add the smallest needed dev dependencies:

```bash
pnpm add -D @playwright/test
pnpm exec playwright install
```

Use one browser project first, preferably Chromium, to keep the first pass fast and stable.

## Proposed Files

- `playwright.config.ts`
- `tests/e2e/concept-graph-editor.spec.ts`
- `package.json`
- `.github/workflows/ci.yml` if CI needs an E2E job

## First Test Slice

1. Start the app with the configured web server.
2. Verify the root concept appears.
3. Add one child concept.
4. Edit the child title.
5. Write an explanation.
6. Set a low score and verify weak-node state.
7. Reload and verify the edited graph remains available.

## Acceptance Criteria

- Playwright runs through `pnpm test:e2e`.
- The first E2E test covers one complete local learning loop.
- The test does not require external services.
- Existing validation still passes:
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`

## Risks

- Current UI may need stable accessible names or test ids.
- LocalStorage and URL state can make tests order-dependent if cleanup is not explicit.
- Browser installation adds setup time in CI.
