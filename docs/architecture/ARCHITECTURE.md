# Architecture

## Core Principle

ConceptGraph is the source of truth.

Everything else is an adapter:
- Pixi renderer
- URL encoder
- Node.js API
- Notion export
- Figma export
- future AWS storage

## Flow

User input
→ ConceptGraph
→ TreePatch / Command
→ Validation
→ Layout
→ Renderer / Storage / Export

## Folder Direction

```txt
src/
  domain/
    conceptGraph/
    learning/
    commands/
  app/
    canvas/
    panels/
  server/
    routes/
    services/
    repositories/
    observability/
  integrations/
    notion/
    figma/
  state/
  utils/

tests/
  unit/
  integration/
  e2e/
```

## Boundary Rules

- Domain cannot import React.
- Domain cannot import Pixi.
- Domain cannot import Node server code.
- Server cannot mutate renderer state.
- Notion/Figma must consume export DTOs, not renderer objects.
