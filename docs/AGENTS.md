# AGENTS.md

## Project Goal

This project is a personal Feynman Learning OS.

It is not just a canvas app.
It is an Understanding System.

The first user is me.

## Read Order

Read only the minimum required documents:

1. CONSTITUTION.md
2. README.md
3. product/VISION.md
4. product/PROBLEM.md
5. product/LEARNING_LOOP.md
6. architecture/ARCHITECTURE.md
7. ENGINEERING_GUIDE.md
8. sprints/CURRENT_SPRINT.md
9. status/PROJECT_HEALTH.md

Do not read unrelated documents unless the task requires them.

## Package Manager Rule

This project uses pnpm.

Always use:
- pnpm install
- pnpm add
- pnpm remove
- pnpm exec
- pnpm dlx

Never use:
- npm
- yarn
- bun

unless explicitly instructed.

## Dependency Rule

Before installing any dependency:

1. Check whether it already exists.
2. Explain why it is needed.
3. Explain alternatives.
4. Ask for approval.

Never install dependencies automatically.

## Architecture Rule

ConceptGraph is the source of truth.

Renderer, API, persistence, Notion, Figma, AWS, and future integrations must be adapters.

Domain code must not import:
- React
- Pixi
- Node server code
- Notion/Figma/AWS SDKs

## Testing Rule

A task is not complete without relevant tests.

Priority:
1. Unit tests for domain logic
2. Integration tests for cross-module behavior
3. Playwright E2E tests for critical UI flows

Do not add unnecessary tests.

## GitHub Rule

You may prepare:
- branch name
- commit message
- issue summary
- PR title
- PR body

Do not:
- commit
- push
- create PR
- merge

unless explicitly approved.

## Documentation Rule

Update only affected documentation.

Do not rewrite the whole README.

Update API docs only when API changes.

## Learning Rule

When a new engineering concept appears, briefly explain:
- what it is
- why it exists
- where it fits
- alternatives
- when to use it

Keep explanations concise.

## Implementation Rule

Implement only the approved task.

Do not anticipate future features.

Do not over-engineer.

## Output Rule

After implementation, return:
- files changed
- tests added
- validation result
- docs updated
- architecture impact
- risks
- suggested commit message
- suggested PR title/body
- next smallest task
