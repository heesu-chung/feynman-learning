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

## Package manager version

The pnpm version is pinned only in `package.json` through `packageManager`.

Do not also set `version` in `pnpm/action-setup`. GitHub Actions treats that as multiple pnpm version sources and can fail with `ERR_PNPM_BAD_PM_VERSION`.

Prefer Corepack in CI so the workflow uses the same package manager declaration as local development:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 24
    cache: pnpm

- run: corepack enable
- run: pnpm install --frozen-lockfile
```
