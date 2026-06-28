# /task

Use this command when the user wants Codex to implement one project task.

## Usage

```text
/task <task title or description>
```

## Behavior

1. Read only:
   - `docs/CONSTITUTION.md`
   - `docs/AGENTS.md`
   - `docs/status/PROJECT_CONTEXT.md`
   - `docs/status/PROJECT_HEALTH.md`
   - files directly relevant to the task
2. Convert the request into an issue-style summary.
3. Determine task complexity.
4. Use branch-first workflow.
5. Do not install dependencies without approval.
6. Implement only the requested task.
7. Run `pnpm typecheck`, `pnpm test`, and `pnpm build`.
8. Summarize validation as a table.
9. Update only affected docs.
10. Commit and push Level 1-2 work to the task branch.
11. Do not merge to `main`.
12. Return prompt feedback and context impact.
