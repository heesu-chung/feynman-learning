# Testing Strategy

## Unit tests

For:
- ConceptGraph validation
- LearningState transitions
- TreePatch application
- URL encode/decode
- scoring logic

## Integration tests

For:
- command -> graph update
- graph -> layout
- API route -> service -> repository
- Notion export adapter with mocked client

## Playwright E2E

Only when UI exists.

Flows:
- create concept
- add child
- write explanation
- mark weak node
- copy URL
- reload from URL
- save/load through API when backend exists
- export to Notion when integration exists
