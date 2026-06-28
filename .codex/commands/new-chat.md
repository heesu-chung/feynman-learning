# /new-chat

Use this command to generate a compact prompt for starting a fresh chat.

## Usage

```text
/new-chat
/new-chat /task <task title>
```

## Behavior

Generate a copy-paste prompt that starts from compact project context instead of long chat history.

If a task is included, embed it as the next task.

## Template

```text
Read only:
- docs/CONSTITUTION.md
- docs/AGENTS.md
- docs/status/PROJECT_CONTEXT.md
- docs/status/PROJECT_HEALTH.md

Task: <task>

Use branch-first workflow.
Return validation as a Markdown table.
Include issue/task summary.
Include prompt feedback and token/context impact.
Do not merge to main unless explicitly instructed.
```
