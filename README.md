# Pedigree

**The human org chart for AI agents.** Pedigree is a governance layer that anchors every enterprise AI agent to an HRIS-verified human parent, inherits that parent's business scope, and produces deterministic audit evidence for every lifecycle and runtime decision.

> **Status:** Early-stage MVP scaffold. The repo currently contains a working FastAPI demo backend, a Vite/React demo UI, a mock Microsoft service, seed fixtures, DB schema stubs, and the full set of product/architecture/security specs. Persistence, the runtime gateway, and the production Microsoft connectors are next.

---

## The problem

Enterprises are about to deploy thousands of AI agents (Copilot Studio bots, Entra Agent ID workloads, custom agents) across sensitive systems. None of the existing IAM tools answer the questions the security team actually has:

- **Who owns this agent?** Not just a tenant or service principal — a *named human* in the org chart.
- **What is it allowed to do?** Did it inherit scope from a manager who left six months ago?
- **What happens when that human is terminated, promoted, or moves teams?**
- **Where is the audit trail** when an agent took an action that wouldn't have been allowed for the human behind it?

Pedigree treats the live HRIS org chart as the source of truth and makes every agent a *digital child* of a verified human.

---

## What Pedigree does

1. **Ingestion & attribution.** Continuously syncs HRIS (Workday / UKG / ADP) into a graph of `Human` nodes with manager chains, entitlements, and status. Pulls Microsoft Dataverse / Entra agent inventories and resolves each agent to an HRIS human via Entra ID, UPN, and email.
2. **Scope inheritance at creation.** When an agent is created, Pedigree snapshots the parent human's live entitlements (Entra groups + HRIS roles + SharePoint access via Graph) and stores it as the agent's intended scope envelope. The envelope can only be tightened, never silently widened.
3. **Policy evaluation.** A policy engine enforces scope-cap, segregation-of-duties (toxic-combination), and approval rules at creation, on reorg, and on every runtime action.
4. **Runtime enforcement.** A `/runtime/evaluate` endpoint (MVP) and an MCP-aware gateway (v1.1) check every tool call against the agent's parent human's *current* entitlements. Allow / Block / Escalate, all logged.
5. **Lifecycle automation — the killer feature.** When HR fires the termination webhook, Pedigree walks the agent subtree, reassigns each agent to a Compliance Archive owner via Power Platform, sets Dataverse `statecode=1`, and writes an immutable audit bundle suitable for SOX / regulator export.
6. **App owner console.** A UI surface that shows, for any human or agent, the full pedigree: parent chain, inherited scope, resources touched, recent decisions, and risk score.

---

## How it works (one diagram)

```
HRIS (Workday / UKG / ADP)
        │
        ▼
   Human nodes — live org chart, manager chain, entitlements, status
        │  (matched on Entra AadUserId / UPN / email)
        ▼
   Agent nodes — Copilot Studio bots, Entra Agent IDs, custom agents
        │  (strict scope inheritance + policy evaluation at creation)
        ▼
   Runtime enforcement — /runtime/evaluate today, MCP gateway next
        │  (SoD, DLP, parent-scope check on every tool call)
        ▼
   Audit log + App Owner Console + cascade deprovision on termination
```

**Invariant:** every AI agent must resolve to an active human parent in the HRIS org chart, *or* Pedigree explicitly marks it orphaned/exceptional and produces audit evidence for remediation.

---

## What's in this repo

```
api/openapi.yaml              # OpenAPI contract for the Pedigree API
apps/web/                     # Vite + React demo UI (app.html, index.html, demo.html)
db/
  postgres/schema.sql         # Relational schema (tenants, agents, mappings, audit, policies)
  neo4j/constraints.cypher    # Graph constraints + indexes
demo/
  mock_data/                  # HRIS, Dataverse, and resource fixtures
  scripts/                    # Demo seed scripts
  static-prototype/           # Original clickable HTML/CSS/JS prototype, preserved
docs/
  product/                    # PRD, launch inventory
  architecture/               # System architecture, data model, Microsoft integration spec
  api/                        # Human-readable API spec
  security/                   # Threat model
  delivery/                   # Roadmap, IaC, test plan, metrics, PoC playbook, dev log
  gtm/                        # Vision, positioning, naming, technical explainer
  design/                     # Design spec and visual references
services/
  api/                        # FastAPI MVP backend (humans, agents, policies, cascade, audit)
  mock_microsoft/             # FastAPI mock for Microsoft Dataverse + Graph endpoints
  ingestion/ graph/ policy/ audit/   # Service seams reserved for the next slice
tests/
  unit/                       # Smoke tests for seed loading, policy, cascade
  integration/ e2e/           # Reserved (currently empty)
docker-compose.demo.yml       # Full local demo stack
```

---

## Quick start

### Full local demo (recommended)

```bash
docker compose -f docker-compose.demo.yml up --build
```

| Surface | URL |
|---|---|
| API-backed web app | http://localhost:3000/app.html |
| Marketing prototype | http://localhost:3000/index.html |
| Clickable product prototype | http://localhost:3000/demo.html |
| Pedigree API docs (Swagger) | http://localhost:8000/docs |
| Mock Microsoft APIs | http://localhost:9000/demo/health |
| Neo4j browser | http://localhost:7474 |
| Postgres | `localhost:5432` |
| Redis | `localhost:6379` |

### Backend only

```bash
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# macOS / Linux
# source .venv/bin/activate

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

---

## CI

GitHub Actions runs on pushes and pull requests to `main`:

- Backend: structure validation, Ruff lint, pytest smoke tests.
- Frontend: `npm install`, TypeScript typecheck, Vite production build.
- Compose: `docker compose config` validation for the demo stack.

---

## What's implemented today

- HRIS, Dataverse, and resource seed fixtures and an in-memory demo store.
- FastAPI endpoints for humans, agents, policies, runtime evaluation, HRIS termination cascade planning, audit events, and a demo summary.
- Mock Microsoft service with corrected OData query parameter aliasing.
- Neo4j constraints + Postgres DDL stubs.
- A first React surface backed by the live API.
- Smoke tests covering seed loading, orphan-policy blocking, and termination cascade planning.

## What's next

1. Migrate the full preserved demo into typed React modules in `apps/web/src/`.
2. Expand the API-backed app beyond the first summary / humans / agents / cascade screens.
3. Persist demo data into Postgres + Neo4j instead of the in-memory store.
4. Scale fixtures to the documented 500-human / 150-agent demo target.
5. Stand up real ingestion connectors and the runtime enforcement gateway.
6. Work through the issues catalogued in [`docs/delivery/CODE_REVIEW_FINDINGS.md`](docs/delivery/CODE_REVIEW_FINDINGS.md).

See [`docs/delivery/Pedigree_90Day_Roadmap.md`](docs/delivery/Pedigree_90Day_Roadmap.md) and [`docs/delivery/IMPLEMENTATION_BACKLOG.md`](docs/delivery/IMPLEMENTATION_BACKLOG.md) for the full plan.

---

## Documentation map

| Topic | Doc |
|---|---|
| Product requirements | [`docs/product/Pedigree_MVP_PRD.md`](docs/product/Pedigree_MVP_PRD.md) |
| High-level architecture | [`docs/architecture/Pedigree_High_Level_Architecture.md`](docs/architecture/Pedigree_High_Level_Architecture.md) |
| Data model | [`docs/architecture/Pedigree_Data_Model_Schema.md`](docs/architecture/Pedigree_Data_Model_Schema.md) |
| Microsoft Copilot Studio integration | [`docs/architecture/Pedigree_Microsoft_Copilot_Studio_Integration_Spec.md`](docs/architecture/Pedigree_Microsoft_Copilot_Studio_Integration_Spec.md) |
| API spec (human-readable) | [`docs/api/Pedigree_Core_API_Spec.md`](docs/api/Pedigree_Core_API_Spec.md) |
| API spec (machine) | [`api/openapi.yaml`](api/openapi.yaml) |
| Security threat model | [`docs/security/Pedigree_Security_Threat_Model.md`](docs/security/Pedigree_Security_Threat_Model.md) |
| 90-day roadmap | [`docs/delivery/Pedigree_90Day_Roadmap.md`](docs/delivery/Pedigree_90Day_Roadmap.md) |
| Implementation backlog | [`docs/delivery/IMPLEMENTATION_BACKLOG.md`](docs/delivery/IMPLEMENTATION_BACKLOG.md) |
| Code review findings | [`docs/delivery/CODE_REVIEW_FINDINGS.md`](docs/delivery/CODE_REVIEW_FINDINGS.md) |
| Design spec | [`docs/design/pedigree_clickable_demo_and_website_design_spec.md`](docs/design/pedigree_clickable_demo_and_website_design_spec.md) |
| How it works (technical) | [`docs/gtm/Pedigree_How_It_Works_Explainer.md`](docs/gtm/Pedigree_How_It_Works_Explainer.md) |
| Positioning & messaging | [`docs/gtm/Pedigree_Positioning_Messaging_Framework.md`](docs/gtm/Pedigree_Positioning_Messaging_Framework.md) |

---

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md). Day-to-day developer notes live in [`docs/delivery/DEVELOPERS_LOG.md`](docs/delivery/DEVELOPERS_LOG.md).

## License

Proprietary — all rights reserved. Contact the maintainer before redistributing.
