# Implement Now Prompt

Read only:

1. CONSTITUTION.md
2. AGENTS.md
3. product/VISION.md
4. product/PROBLEM.md
5. product/LEARNING_LOOP.md
6. architecture/ARCHITECTURE.md
7. architecture/DOMAIN_MODEL.md
8. testing/TESTING_STRATEGY.md
9. sprints/CURRENT_SPRINT.md
10. status/PROJECT_HEALTH.md

Implement Sprint 1 Task 1-3 only:

- Define ConceptGraph types
- Define LearningState
- Add validation
- Add unit tests

Do not implement:
- UI
- Pixi
- REST API
- Notion
- Figma
- AWS
- OpenAI API

Package manager rule:
- Use pnpm only.
- Do not use npm, yarn, or bun.
- Do not install dependencies without approval.

Before editing:
1. Restate the goal.
2. List target implementation files.
3. List target test files.
4. Explain whether any dependency is needed.
5. Wait only if scope expands or dependency install is needed.

Implementation requirements:
- Domain code must be pure TypeScript.
- Domain code must not import React, Pixi, Node server code, Notion, Figma, or AWS.
- Validation must reject:
  - missing root node
  - missing child node
  - circular references
  - invalid learning score ranges
  - invalid learning state
- Tests must cover valid graph and invalid graph cases.

After implementation:
1. Run available pnpm validation commands:
   - pnpm typecheck
   - pnpm lint
   - pnpm test
   - pnpm test:unit
   - pnpm build
2. If a command does not exist, report it.
3. Update only relevant README/status sections if needed.
4. Prepare:
   - branch name
   - commit message
   - PR title
   - PR body
5. Do not commit, push, create PR, or merge without approval.

Final output:
- files changed
- tests added
- validation result
- architecture impact
- risks
- suggested commit message
- suggested PR
- next smallest task
