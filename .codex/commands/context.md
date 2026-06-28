# /context

Use this command to compact and refresh project context.

## Usage

```text
/context
```

## Behavior

1. Read `docs/status/PROJECT_CONTEXT.md`.
2. Read `docs/status/PROJECT_HEALTH.md`.
3. Check current branch and git status.
4. Update `PROJECT_CONTEXT.md` only when a milestone, workflow rule, architecture rule, or next task changed.
5. Return a short fresh-chat handoff prompt.
