# Pedigree — The Human Org Chart for AI Agents

Pedigree is the governance layer that makes the live human org chart the source of truth for enterprise AI agents. Every agent should resolve to an HRIS-verified human parent, inherit that parent’s business scope, and produce deterministic audit evidence for lifecycle and runtime decisions.

## Current Status

This repository has been organized into an implementable monorepo scaffold. It now contains the original product and architecture specifications, the preserved clickable prototype, a Vite-hosted web demo shell, a FastAPI demo API, a fixed mock Microsoft API service, seed data, database schema stubs, and smoke tests.

## Quick Start

### Full local demo

```bash
docker compose -f docker-compose.demo.yml up --build
```

Expected services:

- API-backed web app: `http://localhost:3000/app.html`
- Marketing prototype: `http://localhost:3000/index.html`
- Clickable product prototype: `http://localhost:3000/demo.html`
- Pedigree API: `http://localhost:8000/docs`
- Mock Microsoft APIs: `http://localhost:9000/demo/health`
- Neo4j browser: `http://localhost:7474`
- Postgres: `localhost:5432`
- Redis: `localhost:6379`

### Backend only

```bash
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r services/api/requirements.txt pytest
uvicorn services.api.app.main:app --reload --port 8000
```

### Frontend only

```bash
npm install
npm run dev:web
```

### Tests

```bash
pytest tests/unit
```

### CI validation

GitHub Actions runs the same baseline validation on pushes and pull requests to `main`:

- Backend structure validation, Ruff lint, and pytest smoke tests.
- Frontend npm install, TypeScript typecheck, and Vite production build.
- Docker Compose configuration validation for the full demo stack.

## Repository Structure

```text
api/
  openapi.yaml                    # OpenAPI contract promoted from original spec
apps/
  web/                            # Vite app serving the API-backed app and preserved prototype
    app.html                      # API-backed MVP surface
    index.html                    # Landing page entry
    demo.html                     # Clickable product demo entry
db/
  neo4j/constraints.cypher        # Graph constraints and indexes
  postgres/schema.sql             # Relational MVP schema
demo/
  mock_data/                      # HRIS, Dataverse, and resource fixtures
  scripts/                        # Demo seed scripts
  static-prototype/               # Original root HTML/CSS/JS prototype archive
docs/
  product/                        # PRD and launch inventory
  architecture/                   # System architecture, data model, Microsoft integration
  api/                            # Human-readable API spec
  security/                       # Threat model
  delivery/                       # Roadmap, infra, tests, metrics, PoC
  gtm/                            # Name, vision, positioning, explainer
  design/                         # Design spec, screenshots, uploaded visual references
services/
  api/                            # FastAPI MVP/demo backend
  mock_microsoft/                 # Fixed FastAPI Microsoft mock service
  ingestion/ graph/ policy/ audit/# Service seams for upcoming implementation
tests/
  unit/                           # Smoke/unit tests for the first backend slice
```

## Implemented First Slice

- Organized scattered Markdown specs into `docs/` by purpose.
- Promoted `Pedigree_OpenAPI_Spec.yaml` to `api/openapi.yaml`.
- Preserved the existing visual demo under `apps/web` and `demo/static-prototype`.
- Added a Vite workspace for serving/building the prototype and the first API-backed React app.
- Added a FastAPI backend exposing humans, agents, policies, runtime evaluation, HRIS termination cascade planning, audit events, and demo summary endpoints.
- Fixed the mock Microsoft FastAPI service so OData query parameters use FastAPI aliases instead of invalid Python identifiers.
- Added starter Postgres DDL and Neo4j constraints.
- Added smoke tests for seed loading, orphan policy blocking, and HR termination cascade planning.

## Key Product Invariant

Every AI agent must have a verifiable active human parent from the HRIS org chart, or Pedigree must explicitly mark it orphaned/exceptional and produce audit evidence for remediation.

## Important Docs

- `docs/product/Pedigree_MVP_PRD.md`
- `docs/architecture/Pedigree_High_Level_Architecture.md`
- `docs/architecture/Pedigree_Data_Model_Schema.md`
- `docs/architecture/Pedigree_Microsoft_Copilot_Studio_Integration_Spec.md`
- `docs/api/Pedigree_Core_API_Spec.md`
- `api/openapi.yaml`
- `docs/security/Pedigree_Security_Threat_Model.md`
- `docs/delivery/Pedigree_90Day_Roadmap.md`
- `docs/delivery/IMPLEMENTATION_BACKLOG.md`
- `docs/design/pedigree_clickable_demo_and_website_design_spec.md`

## Next Build Steps

1. Continue migrating the full preserved CDN/Babel demo into typed React modules inside `apps/web/src`.
2. Expand the API-backed app beyond the first summary/humans/agents/cascade screens.
3. Persist demo API data into Postgres and Neo4j instead of in-memory lists.
4. Expand fixture generation to match the documented 500-human / 150-agent demo scale.
5. Add CI for lint, typecheck, tests, and Docker builds.
