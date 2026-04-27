# Pedigree Developers' Log

## 2026-04-27 Repository Organization Baseline

### Built

- Organized the Pedigree System into a monorepo-style repository structure.
- Preserved the polished static demo and landing page visual direction.
- Added a Vite + React + TypeScript frontend workspace at `apps/web`.
- Added an API-backed MVP frontend entrypoint at `apps/web/app.html`.
- Preserved static prototype routes at `apps/web/index.html` and `apps/web/demo.html`.
- Added a FastAPI backend service at `services/api`.
- Added in-memory demo data loading from `demo/mock_data`.
- Added backend API routes for health, humans, agents, policies, runtime evaluation, HR termination cascade planning, audit events, and demo summary.
- Added policy evaluation logic for agent lifecycle, separation-of-duties, and parent scope cap checks.
- Fixed the mock Microsoft API service under `services/mock_microsoft` with valid FastAPI route/query parameter handling.
- Added Dockerfiles for the frontend, backend API, and mock Microsoft service.
- Added `docker-compose.demo.yml` for Postgres, Neo4j, Redis, mock Microsoft API, Pedigree API, and UI services.
- Added starter database artifacts:
  - `db/postgres/schema.sql`
  - `db/neo4j/constraints.cypher`
- Promoted the OpenAPI contract to `api/openapi.yaml`.
- Sorted product, architecture, API, GTM, security, design, and delivery documentation under `docs/`.
- Added backend smoke tests in `tests/unit/test_demo_api.py`.
- Added `scripts/validate_structure.py` for no-dependency structural validation.
- Added dependency/config files for Python, Node, Docker, and local development.

### Validated

- `python scripts/validate_structure.py` passes.
- `docker compose -f docker-compose.demo.yml config --quiet` passes.
- `.\.venv\Scripts\python -m pytest tests/unit` passes with 3 tests.
- `.\.venv\Scripts\python -m ruff check services tests scripts` passes.
- `npm run typecheck --workspace @pedigree/web` passes.
- `npm run build --workspace @pedigree/web` passes.
- `npm install` reports 0 vulnerabilities at the time of this log entry.

### Current Developer TODOs

- Convert more of the preserved CDN/Babel static demo into typed React modules under `apps/web/src`.
- Expand the API-backed frontend beyond the first humans, agents, summary, and termination cascade screens.
- Persist backend demo data into Postgres and Neo4j instead of only using in-memory lists.
- Add repository CI for backend tests, backend lint, frontend typecheck, frontend build, and Docker Compose config validation.
- Expand mock fixture generation toward the documented 500-human / 150-agent demo scale.
- Add integration tests for API-backed frontend workflows.
- Add database migration tooling once persistence work begins.
- Add production-grade environment configuration and secret handling.
- Add authentication and tenant isolation before exposing any non-demo deployment.
- Continue implementing runtime connectors and audit packet generation from the architecture specs.

### Notes for Reviewing Agents

- This is a runnable foundation, not a production implementation.
- The key product invariant is that every AI agent must have a verifiable active human parent or be explicitly marked orphaned/exceptional with audit evidence.
- The existing visual demo should be preserved while implementation moves incrementally into typed React components.
- The backend currently prioritizes a clear demo slice and contract alignment over database persistence.

## 2026-04-27 CI Handoff Update

### Built

- Added GitHub Actions CI at `.github/workflows/ci.yml`.
- Added backend CI checks for structure validation, Ruff lint, and pytest smoke tests.
- Added frontend CI checks for npm install, TypeScript typecheck, and Vite production build.
- Added Docker Compose config validation for the local demo stack.
- Documented the CI validation coverage in `README.md`.

### Developer TODOs Added

- Extend CI with Docker image builds once the demo stack is ready for full container build verification.
- Add integration tests for frontend-to-backend workflows.
- Add coverage reporting when the backend test suite grows beyond smoke tests.

## 2026-04-27 Agent Handoff Update

### Built

- Added `CONTRIBUTING.md` with local validation commands, development priorities, architecture boundaries, and pull request expectations.
- Added GitHub issue templates for backend tasks, frontend tasks, and docs/handoff tasks.
- Clarified acceptance criteria and validation commands for follow-on AI agents and reviewers.
