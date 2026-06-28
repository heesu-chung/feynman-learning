# Engineering Guide

This document defines what I want to learn through this project.

## Core Learning Goals

- TypeScript domain modeling
- Testing: unit, integration, Playwright E2E
- GitHub workflow: branch, commit, PR, review
- REST API design
- Node.js server flow
- OpenAPI documentation when API stabilizes
- Notion export integration
- Figma/FigJam export integration
- Later: AWS persistence and observability

## REST API Learning Goal

REST should be learned through actual product needs:

- save a graph
- load a graph
- update a graph
- delete a graph
- export a learning session

Do not build API before local ConceptGraph and URL sharing are working.

## Node.js Learning Goal

Use backend work to understand:

- request lifecycle
- route/controller/service/repository separation
- validation
- error handling
- logging
- integration tests

## Testing Learning Goal

Start with unit tests.

Only add Playwright when UI flows exist.

## Notion Learning Goal

Notion is an export/archive target.

ConceptGraph remains the source of truth.

## Figma Learning Goal

Figma/FigJam is a visual export target.

Do not convert Pixi objects directly.

Use:
ConceptGraph -> Export DTO -> Figma adapter

## OpenAPI Rule

Use OpenAPI when API routes become stable.

Do not start with OpenAPI before the API shape exists.
