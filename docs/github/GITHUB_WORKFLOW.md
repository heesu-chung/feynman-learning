# GitHub Workflow

## Local setup

```bash
gh auth login
gh auth status
gh auth setup-git
git config user.name "Your Name"
git config user.email "your@email.com"
```

## Branch naming

```txt
sprint/q1-domain
feature/concept-graph
fix/url-decode
```

## Commit style

```txt
feat(domain): add concept graph validation
test(api): add graph save route integration test
docs(product): update learning loop
```

## Human control

Codex may prepare:
- branch name
- commit message
- PR body
- issue draft

Human controls:
- commit approval
- push
- PR creation
- merge
