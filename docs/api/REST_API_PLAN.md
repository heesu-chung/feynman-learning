# REST API Plan

Introduce REST API after local ConceptGraph and URL sharing work.

## First routes

```txt
POST /api/graphs
GET /api/graphs/:id
PUT /api/graphs/:id
DELETE /api/graphs/:id
POST /api/graphs/:id/export/notion
```

## Learn through this

- HTTP method semantics
- status codes
- request validation
- response shape
- error handling
- controller/service/repository separation
- integration tests
