# Pedigree Implementation Backlog

This backlog is for developers and AI agents continuing from the current runnable baseline.

## P0: Preserve and Validate the Current Baseline

### CI and repo hygiene

- Keep GitHub Actions green for every change.
- Avoid committing generated folders such as `.venv/`, `node_modules/`, `.pytest_cache/`, `.ruff_cache/`, and `apps/web/dist/`.
- Keep `docs/delivery/DEVELOPERS_LOG.md` updated after meaningful milestones.

### Smoke test expectations

- Backend smoke tests must continue covering demo summary, runtime policy blocking, and HR termination cascade planning.
- Frontend typecheck and Vite build must remain clean.
- Docker Compose config validation must remain clean.

## P1: API-Backed Frontend Expansion

### Migrate prototype surfaces incrementally

- Move preserved static demo behavior from CDN/Babel files into typed React modules under `apps/web/src`.
- Keep the visual language from the existing demo unless intentionally changing design direction.
- Prefer small screens/components that can be reviewed independently.

### Expand MVP frontend data flows

- Add policy list and policy evaluation screens.
- Add audit event timeline screens.
- Add agent detail view with parent human lineage and scope snapshot.
- Add orphaned-agent remediation screen.
- Add API loading, empty, and error states consistently.

## P1: Backend Persistence

### Database integration

- Add migration tooling for Postgres schema evolution.
- Persist tenants, environments, policies, audit events, resource mappings, and agent metadata in Postgres.
- Persist human/agent lineage relationships in Neo4j.
- Keep demo seed fixtures deterministic.

### Repository/service layer

- Split the current in-memory `DemoStore` into interfaces and concrete adapters.
- Keep the demo adapter available for lightweight local smoke tests.
- Add unit tests for repository/service behavior before wiring persistence into endpoints.

## P1: Policy and Runtime Evaluation

### Policy engine hardening

- Formalize policy rule schemas beyond the current demo keyword checks.
- Add explicit outcomes for allow, deny, review, suspend, transfer, and exception.
- Add policy explainability details suitable for audit packets.

### Runtime gateway simulation

- Add request fixtures for agent actions against resources.
- Evaluate parent entitlement caps and toxic action combinations.
- Emit audit events for every runtime decision.

## P2: Microsoft Connector Depth

### Mock Microsoft API coverage

- Expand mock Graph, Dataverse, Entra, SharePoint, and Purview-like surfaces.
- Add paging, filtering, and failure-mode fixtures.
- Add tests for OData query handling and connector edge cases.

### Real connector planning

- Keep real connector work behind environment-based configuration.
- Do not hardcode credentials.
- Document app registration and least-privilege permission requirements before implementation.

## P2: Demo Scale and Storytelling

### Fixture generation

- Generate deterministic fixture sets near the target demo scale of 500 humans and 150 agents.
- Include terminated employees, inactive owners, shared mailboxes, orphaned agents, and high-risk finance workflows.
- Include multiple departments, managers, and business units.

### Executive demo flow

- Add scripted demo states for before/after HR termination, orphan remediation, and audit export.
- Add a one-command seed/reset flow.
- Add screenshots or short recordings after major visual milestones.

## P2: Security and Production Readiness

### Auth and tenant isolation

- Add authentication before any non-demo deployment.
- Add tenant isolation checks in backend service boundaries.
- Add authorization tests for cross-tenant access attempts.

### Audit and compliance

- Add immutable audit event semantics.
- Add audit packet export format.
- Add retention and redaction strategy documentation.

## P3: Developer Experience

### Local environment

- Add `.env.example` files for each service.
- Add Makefile or task runner shortcuts for common validation commands.
- Add Docker image build validation after Dockerfiles stabilize.

### Testing

- Add frontend component tests once the typed React migration grows.
- Add API integration tests that run against FastAPI TestClient with seeded fixtures.
- Add contract tests against `api/openapi.yaml`.
