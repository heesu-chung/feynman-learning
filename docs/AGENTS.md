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

## Default Task Protocol

When the user provides only a task, automatically follow this protocol:

1. Read `CONSTITUTION.md`, `AGENTS.md`, `status/PROJECT_CONTEXT.md`, and `status/PROJECT_HEALTH.md`.
2. Read only additional documents directly relevant to the task.
3. Determine task complexity:
   - Level 1: small change. Implement directly.
   - Level 2: feature implementation. Review, implement, validate, review.
   - Level 3: architecture change. Perform architecture/security/performance review and wait before broad implementation.
   - Level 4: product-wide change. Review product docs, architecture, decisions, risks, roadmap, then update docs before implementation.
4. For Level 1-2, proceed without asking unless scope expands, dependency installation is needed, or a destructive action is required.
5. Before editing, briefly state target files, architecture impact, and test plan.
6. Implement only the requested task.
7. Run:
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm build`
8. Update only affected README/status/design/docs sections.
9. Use a task branch for implementation work unless the current branch already represents the task.
10. If validation passes, commit and push Level 1-2 work to the task branch automatically.
11. Do not merge to `main` automatically.
12. For Level 3-4 work, ask before implementation and before push.
13. Return changed files, validation result, docs updated, risks, prompt feedback, context note, PR-ready summary, and next smallest task.

Validation results must be summarized as a table.

Do not paste long test logs into the final answer unless the user explicitly asks for raw output.

## Slash Command Rule

Project slash command definitions live in `.codex/commands/`.

Available project commands:

- `/task`: execute one issue-style task using the default task protocol.
- `/validate`: run project validation and return a table.
- `/context`: update compact project context and return a handoff summary.
- `/new-chat`: generate a compact prompt for a fresh chat.

When the user writes a slash command, follow the matching command file first, then apply the rest of `AGENTS.md`.

If the runtime does not natively execute repo-defined slash commands, treat the command file as the instruction source.

## Prompt Feedback Rule

After each task, include a short assessment of the user's request:

- Level: 1-4
- Clarity: strong / okay / risky
- What was good
- One concrete improvement for the next prompt
- Missing issue/task fields, if any
- Token/context impact: low / medium / high

Do not over-teach. Keep this feedback brief and practical.

## Issue / Task Shaping Rule

When the user gives a task, translate it into an issue-style task summary before or after implementation depending on complexity.

For Level 1-2, include the summary in the final answer.

For Level 3-4, show the summary before implementation and wait for approval.

Use this shape:

```md
Title:
Goal:
Scope:
Out of scope:
Done when:
Validation:
Risk:
```

If the user prompt is missing acceptance criteria, infer the smallest safe criteria and mention that assumption.

## Branch / PR Workflow Rule

Default workflow:

1. Start from the latest clean local state.
2. Create a short task branch for implementation work:
   - `chore/...` for workflow/docs/tooling
   - `feat/...` for product features
   - `fix/...` for defects
3. Commit on that branch.
4. Push the branch.
5. Prepare PR title/body.
6. Do not merge into `main` unless explicitly instructed.

Branch names should be lowercase and scoped, for example:

- `feat/weak-node-review-flow`
- `chore/task-protocol`
- `fix/url-state-decode`

If there are already uncommitted changes from the current task, do not switch branches until the user approves or the changes are safely committed/stashed.

## Context Management Rule

Keep `docs/status/PROJECT_CONTEXT.md` as the compact handoff summary.

Update it when:
- a sprint milestone changes
- an architecture rule changes
- a major feature lands
- the next safe task changes

Use it to avoid rereading unrelated documents.

Long chats do not become shorter just because this file exists.

To actually reduce model context usage, start a new chat and ask the agent to read only:

1. `docs/CONSTITUTION.md`
2. `docs/AGENTS.md`
3. `docs/status/PROJECT_CONTEXT.md`
4. the task-relevant files

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
- create PR
- merge

unless explicitly approved.

For Level 1-2 tasks, commit and push the task branch automatically after local validation passes.

For Level 3-4 tasks, ask before commit/push.

Never merge a task branch into `main` without explicit approval.

## GitHub Issue Creation Rule

When asked to create or update a GitHub Issue, first check whether issue creation is available through one of:

- authenticated `gh` CLI
- `GITHUB_TOKEN` or `GH_TOKEN`
- configured GitHub connector/tool

If no authenticated GitHub path is available, do not claim that the issue was created.

Instead:
1. explain the exact blocker, such as missing `gh` CLI or missing token
2. provide a ready-to-paste issue title and body
3. include problem, impact, current understanding, proposed fix, acceptance criteria, and notes
4. continue local branch, docs, or code work if requested

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
- validation result as a Markdown table
- docs updated
- architecture impact
- risks
- prompt feedback
- context note
- issue/task summary
- suggested commit message
- suggested PR title/body
- next smallest task
