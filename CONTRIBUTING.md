# Contributing to Pedigree

## Current Project State

Pedigree is currently a runnable demo foundation and implementation scaffold. The repo contains a preserved static prototype, an API-backed Vite/React frontend entrypoint, a FastAPI backend demo slice, a fixed mock Microsoft API service, starter database schemas, documentation, and CI validation.

## Local Validation

Run these before committing meaningful code changes:

```bash
python scripts/validate_structure.py
.\.venv\Scripts\python -m ruff check services tests scripts
.\.venv\Scripts\python -m pytest tests/unit
npm run typecheck --workspace @pedigree/web
npm run build --workspace @pedigree/web
docker compose -f docker-compose.demo.yml config --quiet
```

On macOS/Linux, replace `.\.venv\Scripts\python` with the Python executable from your virtual environment.

## Development Priorities

1. Preserve the existing product visual direction while migrating the static prototype into typed React components.
2. Keep the key product invariant central: every AI agent must have a verifiable active human parent or an explicit orphan/exception state with audit evidence.
3. Prefer narrow, reviewable changes that keep CI green.
4. Add tests with each backend behavior change.
5. Keep `docs/delivery/DEVELOPERS_LOG.md` updated when major functionality lands.

## Architecture Boundaries

- `apps/web`: frontend surfaces and preserved prototype assets.
- `services/api`: authoritative backend API and policy/demo logic.
- `services/mock_microsoft`: Microsoft API simulator for local demos.
- `demo/mock_data`: seed fixtures shared by backend and mock services.
- `db`: starter database schema/constraint artifacts.
- `docs`: product, architecture, GTM, security, design, and delivery source material.

## Pull Request Expectations

- Explain the product behavior changed.
- List validation commands run.
- Call out any intentional demo-only shortcuts.
- Link or update relevant docs when changing architecture, API contracts, or developer workflow.
