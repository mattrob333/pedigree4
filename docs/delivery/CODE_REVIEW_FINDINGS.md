# Code Review Findings — Pedigree4

**Review date:** 2026-04-27
**Branch:** `main` @ `1dc0426`
**Reviewers:** 4 parallel review agents (Backend, Frontend, Infra/CI/Tests, Docs/Hygiene)
**Purpose:** Inventory of bugs, implementation errors, security issues, and optimization opportunities found in a top-to-bottom audit of the repo. A follow-up coding agent should verify each finding against the current code, then fix and check off the items.

---

## How to use this document

1. Each finding has a unique ID (e.g., `BE-01`, `FE-03`).
2. The "Verify" column is for the next agent to confirm the finding still reproduces — `[ ]` = unverified, `[x]` = verified, `[~]` = could not reproduce / already fixed.
3. The "Fixed" column is for the next agent to mark when a fix has landed.
4. **Always re-read the file before fixing** — line numbers were captured at review time and may drift.
5. Findings are grouped by severity within each domain. Within a severity, the most impactful items come first.

Severity definitions:
- **CRITICAL** — security vulnerability, data loss risk, or breaks production / spec validity. Fix immediately.
- **HIGH** — runtime crash path, broken contract, or build-breaking issue likely to bite in real use.
- **MEDIUM** — correctness or robustness issue that won't crash the demo but will cause problems at scale or in production.
- **LOW** — polish, hygiene, optimization, minor inconsistency.

---

## 1. Backend (Python / FastAPI)

Files in scope: `services/api/app/*`, `services/mock_microsoft/*`, `demo/mock_server.py`, `demo/scripts/*`, `scripts/validate_structure.py`, `tests/unit/*`.

| ID | Severity | Category | File:Lines | Finding | Suggested fix | Verify | Fixed |
|----|----------|----------|------------|---------|---------------|--------|-------|
| BE-01 | CRITICAL | Security | `demo/scripts/seed_demo_data.py:89` | Hardcoded Neo4j password (`"password"`) in source. Will leak in VCS. | Read from env var (`NEO4J_PASSWORD`); document in `.env.example`. | [ ] | [ ] |
| BE-02 | CRITICAL | Security | `services/api/app/settings.py:26` | Default DB connection string contains plaintext `pedigree:demo` credentials baked into source. | Drop the default; require env var; fail loudly if unset in non-demo mode. | [ ] | [ ] |
| BE-03 | HIGH | Bug | `services/api/app/policy.py:7-9` | Unprotected `next(...)` calls — if a policy type is missing from the store the endpoint raises `StopIteration` → 500. | Use `next(iter, None)` and raise a clean 404/422 with a useful message. | [ ] | [ ] |
| BE-04 | HIGH | Bug | `tests/unit/test_demo_api.py:19` | Test indexes `agents[0]` without asserting non-empty; will `IndexError` if seed data changes. | Assert `len(agents) > 0` before indexing, or pin a known fixture. | [ ] | [ ] |
| BE-05 | HIGH | Implementation | `services/api/app/main.py:86-99` | `/v1/agents/{agent_id}/reassign` returns `202 Accepted` *and* the audit event body. 202 implies async processing. | Either return `200` (sync) or return 202 with only a status URL/empty body. | [ ] | [ ] |
| BE-06 | HIGH | Security | `services/api/app/main.py:26-32` | CORS allows `methods=["*"]` and `headers=["*"]`. Overly permissive even for localhost. | Restrict to required verbs (`GET`, `POST`) and explicit headers. | [ ] | [ ] |
| BE-07 | HIGH | Security | `services/api/app/main.py:122` | `/v1/webhooks/hris/termination` has no auth — anyone can trigger termination cascades. | Require HMAC signature or shared-secret bearer token; verify before acting. | [ ] | [ ] |
| BE-08 | HIGH | Security | `services/mock_microsoft/mock_server.py:73-78` | `update_bot` accepts an unbounded dict and merges it into agent state — clients can mutate `risk_score`, `status`, ownership, etc. | Define a Pydantic model with an explicit allowlist of mutable fields. | [ ] | [ ] |
| BE-09 | MEDIUM | Logic | `services/api/app/policy.py:22-28` | SoD check uses `any(item in toxic_actions for item in agent_actions)` — reads as "subset" rather than "intersection." Likely intent: block if requested action is toxic AND agent already holds another toxic action. | Rework with explicit set intersection and document the policy semantics. | [ ] | [ ] |
| BE-10 | MEDIUM | Logic | `services/api/app/policy.py:30-39` | Entitlement check joins entitlements with spaces and does substring matching → `"app"` matches `"approve"`. False positives. | Tokenize and use set membership, not substring `in`. | [ ] | [ ] |
| BE-11 | MEDIUM | Bug | `services/api/app/settings.py:11-21` | `default_seed_data_path()` indexes `valid_candidates[0]` with no guard — will `IndexError` if all candidate paths are missing. | Raise a clear `RuntimeError` with the search list when nothing resolves. | [ ] | [ ] |
| BE-12 | MEDIUM | Logic | `services/api/app/demo_store.py:51-62` | `_resolve_owner()` runs the same email-match loop twice. | Remove the redundant second loop. | [ ] | [ ] |
| BE-13 | MEDIUM | Config | `services/api/requirements.txt` | `neo4j`, `psycopg`, `redis` listed but never imported by `services/api/app/`. Bloats prod image. | Move to a separate extras file or delete until actually used. | [ ] | [ ] |
| BE-14 | MEDIUM | Config | `services/api/app/settings.py:31` | `extra="ignore"` silently drops typo'd env vars. | Switch to `extra="forbid"` (or at minimum log unknowns). | [ ] | [ ] |
| BE-15 | MEDIUM | Bug | `services/api/app/main.py:45,66` (list_humans / list_agents) | `limit`/`offset` not validated at the `Query(...)` level (no `ge`/`le`). OpenAPI says `ge=1, le=500`. | Add `Query(50, ge=1, le=500)` etc. and validate `status`/`platform` against the documented enums. | [ ] | [ ] |
| BE-16 | LOW | Implementation | `services/api/app/main.py:35` | `store()` reads `app.state.store` with no guard — `AttributeError` if lifespan failed. | Defensive `getattr` + clear startup-failure error. | [ ] | [ ] |
| BE-17 | LOW | Logic | `services/api/app/demo_store.py:43` | Unknown status values silently coerced to `"active"` with no log. | Emit a warning so operators notice malformed seed data. | [ ] | [ ] |
| BE-18 | LOW | Implementation | `demo/scripts/seed_demo_data.py:22-76` | No transaction / rollback — partial seed leaves DB inconsistent on failure. Also uses `randomUUID()` while app uses deterministic `uuid5`. | Wrap in a Neo4j transaction; reuse the deterministic ID strategy. | [ ] | [ ] |
| BE-19 | LOW | Style | `services/mock_microsoft/mock_server.py:26-42` | Inline `entra_id` derivation logic is non-obvious. | Extract a small helper. | [ ] | [ ] |
| BE-20 | LOW | Style | `services/api/app/main.py:39-42` | `/health` calls `get_settings()` per request (cached, but unnecessary). | Reference settings via `app.state` once at startup. | [ ] | [ ] |

---

## 2. Frontend (React / Vite / TypeScript)

Files in scope: `apps/web/src/*`, `apps/web/index.html`, `app.html`, `demo.html`, `apps/web/package.json`, `tsconfig.json`, `vite.config.ts`, `Dockerfile`.

| ID | Severity | Category | File:Lines | Finding | Suggested fix | Verify | Fixed |
|----|----------|----------|------------|---------|---------------|--------|-------|
| FE-01 | CRITICAL | Build | `apps/web/vite.config.ts:14-18` | `demo.html` is referenced but not declared as a Rollup input. `npm run build` won't bundle it. | Add `demo: fileURLToPath(new URL('demo.html', import.meta.url))` to `rollupOptions.input`. | [ ] | [ ] |
| FE-02 | HIGH | Implementation | `apps/web/src/api.ts:3` | Silent fallback to `http://localhost:8000` if `VITE_API_URL` is unset. Production builds will quietly point at localhost. | Fail the build (or runtime) when the env var is missing in non-dev mode. | [ ] | [ ] |
| FE-03 | HIGH | Type Safety | `apps/web/src/api.ts:19` | `response.json() as Promise<T>` is a blind cast — bypasses validation; mismatched API shapes crash silently at use sites. | Validate at the boundary with Zod / valibot, or at minimum return `unknown` and narrow at call sites. | [ ] | [ ] |
| FE-04 | HIGH | Bug | `apps/web/src/App.tsx:158-160` | `key={action}` on a list of action strings — duplicates produce React reconciliation bugs. | Use a stable composite key (`${agent.agent_id}-${idx}`) or guarantee uniqueness in the data layer. | [ ] | [ ] |
| FE-05 | HIGH | Bug | `apps/web/src/App.tsx:36-55` | Empty `useEffect` deps mean data only loads once; no refresh path after mutations (e.g., post-cascade). | Expose a `reload()` callback or invalidate after mutations. | [ ] | [ ] |
| FE-06 | MEDIUM | UX | `apps/web/src/App.tsx:64-76` | After running cascade, no way to clear the result and run another simulation without a page reload. | Add a "Clear" / "Run again" control. | [ ] | [ ] |
| FE-07 | MEDIUM | UX | `apps/web/src/App.tsx:62` | `simulationTarget` can be `undefined` (button disabled) but no message tells the user why. | Render an empty-state hint when no terminated/initial human is available. | [ ] | [ ] |
| FE-08 | MEDIUM | Robustness | `apps/web/src/api.ts:5-20` | Hardcoded `Content-Type: application/json` cannot be overridden; raw `response.text()` returned as error message can dump server internals into the UI. | Allow header override via `init.headers`; truncate / sanitize error bodies. | [ ] | [ ] |
| FE-09 | MEDIUM | Build | `apps/web/package.json:17` (and Dockerfile) | Dev deps pinned to `"latest"` — non-reproducible builds. | Pin to caret/tilde versions and commit `package-lock.json` updates. | [ ] | [ ] |
| FE-10 | MEDIUM | Build | `apps/web/Dockerfile` | No multi-stage build; runs `npm run dev` (Vite dev server) as the production CMD; ships `node_modules` and source. | Multi-stage: `npm ci && npm run build` in builder, serve `dist/` from a static stage (nginx or `serve`). | [ ] | [ ] |
| FE-11 | LOW | UX | `apps/web/src/main.tsx:6-10` | Generic root-not-found error message. | Show a user-facing fallback if mount fails. | [ ] | [ ] |
| FE-12 | LOW | Maintainability | `apps/web/index.html:494,511,882-1047` | Large inline `<script>` blocks and inline `onclick` handlers in `index.html`. | Extract to modules if this grows past prototype scope. | [ ] | [ ] |

---

## 3. Infra, Docker, CI, DBs, OpenAPI

Files in scope: `docker-compose.demo.yml`, all `Dockerfile`s, `infra/{docker,terraform}/`, `db/{neo4j,postgres}/`, `.github/`, `.dockerignore`, `.gitignore`, `tests/`, `scripts/validate_structure.py`, `api/openapi.yaml`.

### Spec / Implementation drift (OpenAPI ↔ FastAPI)

| ID | Severity | Category | File:Lines | Finding | Suggested fix | Verify | Fixed |
|----|----------|----------|------------|---------|---------------|--------|-------|
| INF-01 | CRITICAL | Spec | `api/openapi.yaml:29 & 418` | `components:` defined twice — duplicate key invalidates the spec. | Delete the second block (lines ~418-425). | [ ] | [ ] |
| INF-02 | CRITICAL | Drift | `services/api/app/main.py:56-62` vs `api/openapi.yaml:240` | `GET /v1/humans/{id}` returns `{data, child_agents}` but the spec says it returns a bare `Human`. | Update the OpenAPI response schema (preferred) or unwrap the response. | [ ] | [ ] |
| INF-03 | CRITICAL | Drift | `services/api/app/main.py:135-137` | `GET /v1/audit/events` is implemented but **not** in the OpenAPI spec. | Add the path + schema to `openapi.yaml`. | [ ] | [ ] |
| INF-04 | CRITICAL | Drift | `services/api/app/main.py:140-151` | `GET /v1/demo/summary` is implemented but **not** in the OpenAPI spec. | Add the path + schema, or move under `/internal/`. | [ ] | [ ] |
| INF-05 | MEDIUM | Drift | `api/openapi.yaml:189` vs `services/api/app/main.py:45` | `status` declared as enum `[active, terminated]`, but implementation accepts any string. | Validate against the documented enum (or expand the enum). | [ ] | [ ] |
| INF-06 | MEDIUM | Drift | `api/openapi.yaml:255` vs `services/api/app/main.py:66` | `platform` enum declared but not validated server-side. | Add `Query(..., pattern=...)` or explicit enum check. | [ ] | [ ] |
| INF-07 | MEDIUM | Drift | `api/openapi.yaml:335` | `$ref` syntax may be malformed for the 400 response. | Run an OpenAPI linter/validator and correct. | [ ] | [ ] |

### Compose, Dockerfiles, CI

| ID | Severity | Category | File:Lines | Finding | Suggested fix | Verify | Fixed |
|----|----------|----------|------------|---------|---------------|--------|-------|
| INF-08 | CRITICAL | Reliability | `docker-compose.demo.yml` | No healthchecks; `depends_on` waits for container *start*, not service readiness. API can boot before Postgres/Neo4j accept connections. | Add healthchecks (Postgres TCP/5432, Neo4j HTTP/7474, Redis `PING`); use `condition: service_healthy`. | [ ] | [ ] |
| INF-09 | CRITICAL | Security | `docker-compose.demo.yml:6,16` | Plaintext credentials in compose env (`POSTGRES_PASSWORD: demo`, `NEO4J_AUTH: neo4j/password`). | Move to a `.env` file with a checked-in `.env.example`; document in CONTRIBUTING. | [ ] | [ ] |
| INF-10 | CRITICAL | Security | `.github/workflows/ci.yml` | Workflow has no top-level `permissions:` block — defaults to broad token scope. | Add `permissions: { contents: read }` at workflow root; elevate per-job as needed. | [ ] | [ ] |
| INF-11 | HIGH | Optimization | `services/api/Dockerfile` | Single-stage build, copies `demo/mock_data` into the runtime image, COPY order invalidates pip cache on app changes. | Multi-stage build; copy `requirements.txt` first, install, then copy `app/`; gate demo data behind a build arg. | [ ] | [ ] |
| INF-12 | HIGH | Bug | `apps/web/Dockerfile` | Runs `npm run dev` as CMD — Vite dev server in a "production" container. | See FE-10 (multi-stage + static serve). | [ ] | [ ] |
| INF-13 | HIGH | Reliability | `docker-compose.demo.yml:58-65` | `ui` sets `VITE_API_URL=http://localhost:8000`; inside the container that won't resolve to the API service. | Use `http://api:8000` for in-network calls (or document that the UI is only reachable via host). | [ ] | [ ] |
| INF-14 | HIGH | Tests | `tests/integration/`, `tests/e2e/` | Both directories empty; CI only runs `tests/unit`. Risk that future tests added here are silently not executed. | Either populate with real tests or remove the empty dirs and document the deferral. | [ ] | [ ] |
| INF-15 | MEDIUM | Security/Config | `services/api/app/main.py:26-32` | CORS origins hardcoded to `localhost:3000`/`127.0.0.1:3000`. | Pull from settings; default empty in non-demo mode. | [ ] | [ ] |
| INF-16 | MEDIUM | Config | `services/api/requirements.txt` | Deps use `>=` rather than pinned versions — non-reproducible builds. | Pin exact versions or use a constraints file. | [ ] | [ ] |
| INF-17 | MEDIUM | Optimization | `.dockerignore` | Doesn't exclude `docs/`, `scripts/`, `tests/`, `demo/static-prototype/` — bloats image context. | Add those entries. | [ ] | [ ] |
| INF-18 | LOW | Optimization | `.github/workflows/ci.yml:47` | `docker compose ... config --quiet` only validates YAML; doesn't catch build/runtime issues. | Add a `docker compose build` step (and optionally a `up --wait` smoke). | [ ] | [ ] |

### Databases

| ID | Severity | Category | File:Lines | Finding | Suggested fix | Verify | Fixed |
|----|----------|----------|------------|---------|---------------|--------|-------|
| DB-01 | MEDIUM | Schema | `db/postgres/schema.sql` | Foreign keys to `tenants.tenant_id` lack `ON DELETE CASCADE`; orphaned rows possible. Audit/policy tables reference humans by string id, no FK. | Add cascade rules; align id types and add FKs where appropriate. | [ ] | [ ] |
| DB-02 | MEDIUM | Schema | `db/postgres/schema.sql:22` | `agent_resource_mappings` lacks a UNIQUE on `(tenant_id, agent_id, resource_id, access_type)`. | Add the unique constraint. | [ ] | [ ] |
| DB-03 | MEDIUM | Schema | `db/postgres/schema.sql:27-34` | Enum-style strings (`hris_type`, `type`) have no CHECK constraint; jsonb columns have no documented schema. | Add CHECK constraints; document jsonb shape. | [ ] | [ ] |
| DB-04 | MEDIUM | Schema | `db/neo4j/constraints.cypher` | No indexes on commonly-filtered properties (`status`, `risk_score`, composite `tenant_id+status`). | Add indexes (with `IF NOT EXISTS`). | [ ] | [ ] |
| DB-05 | LOW | Bug | `services/api/app/demo_store.py` (around line 26) | Deterministic `uuid5(NAMESPACE_URL, ...)` collides if two seed rows share the same `external_id` within a tenant. | Detect and raise on collision during seed load. | [ ] | [ ] |

---

## 4. Docs & Repo Hygiene

Files in scope: `README.md`, `CONTRIBUTING.md`, `docs/**`, `demo/README.md`, top-level `package.json`, working-tree directory structure.

| ID | Severity | Category | File:Lines | Finding | Suggested fix | Verify | Fixed |
|----|----------|----------|------------|---------|---------------|--------|-------|
| HYG-01 | CRITICAL | Hygiene | `./%USERPROFILE%Downloads/` | Literal directory named `%USERPROFILE%Downloads` exists at repo root — Windows shell-expansion accident. Empty but committed-style presence. | Delete the directory; add a `.gitignore` rule to prevent re-creation; investigate the command that produced it. | [ ] | [ ] |
| HYG-02 | HIGH | BrokenRef | `demo/README.md:14, 120` | Instructs `python scripts/seed_demo_data.py` but the file lives at `demo/scripts/seed_demo_data.py`. Command fails from repo root. | Update both lines to the correct path. | [ ] | [ ] |
| HYG-03 | HIGH | Hygiene | `services/**/__pycache__/`, `.pytest_cache/`, `.ruff_cache/` | Cache dirs present in working tree. `.gitignore` covers them, but they clutter the tree. | Run `git clean -Xdn` to preview, then `git clean -Xdf` (or targeted `rm -rf`). | [ ] | [ ] |
| HYG-04 | HIGH | Security | `docker-compose.demo.yml` | (Same root cause as INF-09 — flagged separately because docs propagate the pattern.) | Cross-reference INF-09; ensure CONTRIBUTING shows the `.env` flow. | [ ] | [ ] |
| HYG-05 | MEDIUM | Drift | `package.json:14-16` vs `.github/workflows/ci.yml:34` | Root `package.json` says Node `>=20`; CI pins `node-version: "22"`. | Pick one (recommend `>=22`) and align both. | [ ] | [ ] |
| HYG-06 | MEDIUM | Outdated | `README.md:32`, `CONTRIBUTING.md:13-20` | Mixes Windows PowerShell and Unix activation syntax without clear OS split. | Add an OS-aware "Setup" block. | [ ] | [ ] |
| HYG-07 | MEDIUM | Missing | repo root | No `LICENSE`, `CHANGELOG.md`, or `SECURITY.md` despite a `docs/security/` folder. | Add appropriate files; `SECURITY.md` can simply point to the security docs. | [ ] | [ ] |
| HYG-08 | LOW | Outdated | `docs/delivery/DEVELOPERS_LOG.md:38-49,68-72` | Internal TODOs interleaved with user-facing log entries — confusing for outside readers. | Split into "State" vs "Backlog" sections (or move TODOs to `IMPLEMENTATION_BACKLOG.md`). | [ ] | [ ] |
| HYG-09 | LOW | Missing | `apps/web/`, `services/api/` | `.env.example` files referenced in docs (`DEMO_MODE=true`, `VITE_API_URL`) do not exist. | Create the example env files and reference them from the READMEs. | [ ] | [ ] |
| HYG-10 | LOW | Drift | `api/openapi.yaml:20-22` | Spec advertises `https://api.pedigree.ai/v1` as a server, but this is a demo scaffold. | Add a comment clarifying current vs aspirational servers, or split demo/prod specs. | [ ] | [ ] |

---

## Aggregate counts

- CRITICAL: **9** (BE-01, BE-02, FE-01, INF-01, INF-02, INF-03, INF-04, INF-08, INF-09, INF-10, HYG-01) — *11 if you count INF-10 separately from BE security; treat the count as ~11.*
- HIGH: ~14
- MEDIUM: ~20
- LOW: ~14

> Numbers are approximate; verify each ID independently.

---

## Suggested fix order for the next agent

1. **Stop the bleeding** — BE-01, BE-02, INF-09, INF-10, HYG-01 (security + repo hygiene that should never have been committed).
2. **Restore spec validity** — INF-01 → INF-04 (OpenAPI duplicate `components` and missing/mismatched endpoints).
3. **Make CI honest** — INF-08, INF-13, INF-14, FE-01 (compose readiness, container API URL, empty test dirs, missing Vite input).
4. **Crash-path bugs** — BE-03, BE-04, FE-02, FE-03, FE-04 (runtime failures users will hit).
5. **Sweep the rest** by domain in severity order.

After fixing each item, flip `Verify` and `Fixed` in the table, and reference the commit hash next to the row if useful.
