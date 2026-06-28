# /validate

Use this command to run the project validation suite and report results concisely.

## Usage

```text
/validate
```

## Behavior

Run:

```bash
pnpm typecheck
pnpm test
pnpm build
```

If the dev server is relevant or already running, also check:

```bash
curl -I http://localhost:3000
```

## Output

Always return validation as a Markdown table. Do not paste raw logs unless requested.
