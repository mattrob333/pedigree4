# Pedigree 90-Day MVP Roadmap & Release Plan
**Version:** 1.0  
**Date:** April 27, 2026  
**Target:** Ship production-ready MVP + successful design partner PoC (Wesco/Anixter) by ~July 27, 2026.  
**Team Assumption:** 4–6 engineers (backend, frontend, platform/security, 1–2 platform/M365 specialists) + Product + Design.

---

## Phase Overview (12 Weeks / 6 Sprints)

**Sprint 0 (Week 0 – Pre-kickoff, 3–5 days):** Repo setup, architecture spike, Entra app registration template, Dataverse test environment provisioning, HRIS (Workday) sandbox access.

**Sprint 1–2 (Weeks 1–4):** Foundation — Core platform, authentication, ingestion, basic graph.

**Sprint 3–4 (Weeks 5–8):** Core value — HR lifecycle, attribution, policy stub, console.

**Sprint 5–6 (Weeks 9–12):** Hardening, runtime demo, PoC execution, security review, launch.

**Post-MVP (Week 13+):** Iterate on feedback, add full gateway, expand to other platforms, sales enablement.

---

## Detailed Sprint Breakdown

### Sprint 1: Platform Skeleton + Auth + Basic Ingestion (Weeks 1–2)
**Goals:** Working multi-tenant backend with Entra auth, RBAC, and first Dataverse connector.

**User Stories / Tasks:**
- Repo structure, Terraform/Bicep for core Azure resources (AKS/Container Apps, Postgres, Redis, Key Vault, Log Analytics).
- FastAPI skeleton with Entra OIDC + RBAC middleware (iam_admin, app_owner, viewer).
- PostgreSQL schema migrations + basic models (tenants, environments, humans stub, agents stub, audit_events).
- Neo4j setup + first nodes/edges (test Human + Agent + :PARENT_OF).
- Dataverse connector (Python SDK + OData client) — list environments, query `bots` with owner expand.
- Entra Graph connector — resolve AadUserId → user details + manager.
- Basic UI shell (React + Vite + Tailwind) with login + empty dashboard.
- CI/CD pipeline (GitHub Actions) → build, test, deploy to dev environment.

**Definition of Done:**
- Engineer can `docker compose up` and see authenticated UI + API returning "Hello from Pedigree".
- Dataverse test env connected; 10+ bots listed via API.
- All code + docs committed; architecture review passed.

**Risks Mitigated:** Auth & multi-tenancy foundation solid before business logic.

### Sprint 2: Full Ingestion + Graph Attribution (Weeks 3–4)
**Goals:** Automatic discovery + human attribution for Copilot Studio agents.

**Stories:**
- Full Dataverse incremental sync (change tracking or polling + watermark).
- HRIS connector (Workday REST or CSV upload for PoC) + Human node creation + :MANAGES edges.
- Attribution logic: bot.ownerid / createdby → Entra → HRIS Human match (exact + fuzzy fallback).
- Orphan detection + basic "Suggest Parent" (simple rules: same department + job title similarity).
- Graph write path with conflict resolution + audit_events.
- Dashboard: "Agents by Human" + orphan list (first cut).
- API: GET /agents, GET /humans, POST /humans/sync, GET /agents/orphans.

**DoD:**
- 100% of test agents attributed or flagged as orphan within 5 minutes of sync.
- Cascade simulation (manual trigger) works end-to-end (graph update + audit log).
- UI shows live org chart snippet + agent list.

**Milestone:** First "magic moment" — create agent in Copilot Studio → appears in Pedigree with correct human parent.

### Sprint 3: Lifecycle + Scope + Basic Policy (Weeks 5–6)
**Goals:** HR-tied deprovision + scope enforcement at creation time.

**Stories:**
- HR termination webhook + cascade job (reassign via Power Platform API + set bot inactive + full subtree update).
- Scope snapshot on agent create/update (pull parent's entitlements via Entra Graph + HRIS).
- Basic policy engine (Python rules): scope subset check + simple SoD matrix.
- Policy evaluation on ingestion + creation-time blocking/flagging.
- Simulation mode: "What if this human terminates?" → preview affected agents + decisions.
- API: POST /agents/{id}/reassign, POST /policies, GET /policies/evaluate.
- UI: Policy editor (simple form) + simulation wizard + risk dashboard.

**DoD:**
- Simulate termination of test human → all agents reassigned via real Power Platform API + audit bundle exported.
- Agent created with scope > parent's entitlements is flagged/blocked with clear explanation.
- Design partner can run simulation in UI and approve.

**Milestone:** "When the human leaves, the agents are gone" — core thesis proven.

### Sprint 4: App Owner Console + Runtime Stub (Weeks 7–8)
**Goals:** Empower app owners + prove runtime enforcement concept.

**Stories:**
- Resource discovery (SharePoint sites + Dataverse tables via Graph + Dataverse metadata API).
- Agent ↔ Resource mapping (from knowledge sources + actions in botcomponent).
- App Owner Console UI: list resources + linked agents (with human Pedigree) + one-click revoke.
- Runtime gateway stub (FastAPI proxy): receive action call → lookup agent/human → evaluate policy → allow/block + log.
- Sample integration: 2–3 test actions (e.g., "CreateVendor", "ApprovePayment") wired through proxy.
- Notifications (email/Teams) on revoke or violation.
- API: GET /resources, POST /resources/{id}/revoke, POST /runtime/evaluate.

**DoD:**
- App owner logs in → sees their SharePoint site with 3 agents + human owners → revokes one successfully.
- Demo action through proxy is blocked on SoD violation with full Pedigree context in response + log.
- End-to-end PoC script passes internally.

**Milestone:** "App owners love it and runtime actually stops bad actions."

### Sprint 5: Hardening + Security + Observability (Weeks 9–10)
**Goals:** Production-grade security, monitoring, and PoC readiness.

**Stories:**
- Full security controls (WAF, private endpoints, Key Vault, managed identities, PIM for admins).
- OpenTelemetry + Prometheus/Grafana dashboards (ingestion lag, policy eval latency, cascade success rate, orphan trends).
- Pen-test fixes (internal + external if time/budget allows).
- Performance tuning (indexes, caching, query optimization for 5k–10k agents).
- Audit export (signed JSON bundle for SOX evidence).
- Documentation: Runbooks, admin guide, design partner training materials.
- Load testing (simulated 10k agents + 100 terminations).

**DoD:**
- All critical/high pen-test findings closed.
- Dashboards green; p99 policy eval <10ms; cascade completes <60s for 50 agents.
- Security review sign-off.

### Sprint 6: PoC Execution + Launch (Weeks 11–12)
**Goals:** Successful design partner demo + MVP sign-off.

**Stories:**
- Final PoC environment setup with real (anonymized) Wesco data.
- End-to-end demo rehearsal + dry run with design partner stakeholders.
- Customer training + handoff (UI walkthrough, simulation, revoke, audit export).
- Reference quote collection + case study draft.
- Post-PoC backlog grooming (full gateway, other HRIS, self-service portal, pricing).
- Internal retrospective + metrics review vs PRD success criteria.

**DoD:**
- Design partner signs off on all ACs in PRD.
- Reference quote secured.
- MVP declared "shipped" — code tagged v1.0, deployed to prod tenant.
- Sales/GTM handoff complete (deck, battlecard, one-pager updated with PoC results).

---

## Key Milestones & Checkpoints
- **Week 4:** First live attribution in customer-like environment.
- **Week 8:** End-to-end cascade + runtime stub demo ready.
- **Week 10:** Security sign-off + performance targets met.
- **Week 12:** PoC success + MVP launch.

**Go/No-Go Gates:**
- End of Sprint 2: Graph + attribution reliable? → Proceed or extend Sprint 2.
- End of Sprint 4: PoC script passes internally with <5% failure rate? → Proceed to hardening.
- End of Sprint 5: Pen-test clean + performance green? → PoC week.

---

## Resource & Budget Assumptions (MVP)
- **Engineering:** 5 FTE (2 backend/graph, 1 frontend, 1 platform/security, 1 M365 specialist) × 12 weeks.
- **Infra:** Azure spend ~$2–4k/month during PoC (scales with agents).
- **External:** Pen-test firm (if not internal), Workday sandbox access, design partner time (10–20 hours total).
- **Contingency:** 10–15% buffer in Sprint 5–6 for fixes.

---

## Post-MVP (Immediate Backlog — Q3 2026)
- Full production MCP-aware gateway (sub-5ms, WAF, Kong/Solo partnership?).
- Entra Agent ID GA sync + blueprint policy fusion.
- Additional HRIS (UKG, ADP, UKG Dimensions) + self-service mapping UI.
- Self-service agent request portal with auto-scope calculation.
- Advanced SoD (stateful across sessions) + DLP redaction.
- Marketplace packaging + usage-based billing.
- Expansion to non-Microsoft agents (LangChain, AutoGen, Zapier, n8n via MCP/REST ingestion).
- Predictive analytics ("which humans are at highest risk of creating rogue agents?").

---

**This roadmap is aggressive but achievable with focused execution and a strong design partner.** It delivers the core thesis in 90 days and sets up the moat for the next 12–18 months.

All supporting artifacts (PRD, Architecture, Data Model, API Spec, Security Model, Test Plan, IaC) are being produced in parallel and will live in `/docs` and `/infra` in the repo.

Ready for the coding agent to clone and start Sprint 0. Let's build Pedigree.