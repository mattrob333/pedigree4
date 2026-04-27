# Pedigree High-Level Architecture Document
**Version:** 1.0  
**Date:** April 27, 2026  
**Audience:** Engineering, Architecture Review Board  
**Traceability:** Maps directly to MVP PRD user stories (Epic 1–5).

---

## 1. Guiding Principles
- **Org-Chart First:** The HRIS-derived human graph is the single source of truth. All agent identity, scope, policy, and lifecycle decisions flow from the parent-human node.
- **Complementary to Microsoft:** We consume native Microsoft primitives (Dataverse `bot.ownerid`, Entra Agent ID sponsor/blueprint, reassign API, Entra Conditional Access) and add the missing depth (full org lineage, strict inheritance, cross-system SoD, HR cascade).
- **Least Privilege & Zero Trust:** Every component authenticates via Entra, uses short-lived tokens, and evaluates policy at the edge.
- **Event-Driven + Reliable Fallback:** Prefer webhooks/Dataverse change tracking; always have polling + reconciliation as fallback.
- **Multi-Tenant Isolation:** Strict tenant boundaries; customer data never leaves their control plane.
- **Evolvability:** MVP uses simple rules engine; v1.1+ introduces OPA/Rego + MCP full gateway without rewriting core.

---

## 2. System Context (C4 Level 1)
**Actors:**
- **Human (Maker/User):** Creates agents in Copilot Studio; interacts via Teams/web.
- **HR Admin / IAM Admin:** Configures Pedigree, reviews orphans/risks, sets policies.
- **App Owner:** Views/revokes agent access to their resources (SharePoint, Dataverse, etc.).
- **External Systems:** HRIS (Workday), Entra ID, Dataverse/Power Platform, Microsoft Graph, SIEM, (future) MCP gateways, other IdPs.

**Pedigree System Boundary:**
- Ingests from HRIS + Microsoft control planes.
- Maintains authoritative lineage graph.
- Enforces policy at creation time + runtime stub.
- Exposes UI + APIs for admins/app owners.
- Outputs audit events.

**Key External Interfaces (MVP):**
- HRIS: Workday REST (or CSV/webhook for PoC) → employee lifecycle events.
- Microsoft: Dataverse Web API, Power Platform reassign API, Entra ID Graph, (optional) Entra Agent ID.
- SIEM: JSON/CEF export (Splunk, Sentinel, etc.).

---

## 3. High-Level Component Diagram (C4 Level 2)
```
[HRIS Webhook / Poller] --> [Ingestion Service] --> [Shadow Org Graph (Neo4j)]
[Dataverse Connector] --> [Ingestion Service]
[Entra Graph Connector] --> [Ingestion Service]
                                      |
                                      v
[Policy Engine (Rules + Scope Snapshot)] <--> [Graph DB]
                                      |
                                      v
[Runtime Gateway Stub (FastAPI proxy)] <--> [Copilot Studio Actions / MCP]
                                      |
                                      v
[Audit Logger] --> [SIEM Export]
                                      |
                                      v
[Web UI (React)] <--> [API Gateway (FastAPI + Entra OIDC)]
                                      |
                                      v
[App Owner Console] <--> [Resource Connectors (SharePoint Graph, Dataverse)]
```

**Core Services (to be deployed as separate containers or functions for scalability):**
1. **Ingestion Service** (Python/FastAPI): Dataverse poller/webhook handler, Entra user resolver, HRIS sync, graph writer.
2. **Shadow Org Graph Service**: Neo4j driver + Cypher queries for parent-child, subtree queries, cascade logic.
3. **Policy Engine**: Simple Python rules for MVP (scope subset check, basic SoD matrix). Pluggable for OPA later.
4. **Runtime Gateway Stub**: FastAPI proxy/middleware that receives action calls (or MCP), looks up agent → human in graph, evaluates policy, forwards or blocks, logs.
5. **Audit & Export Service**: Structured logging + SIEM push (async).
6. **API Gateway + Auth**: FastAPI with Entra OIDC + RBAC (IAM Admin, App Owner, Viewer roles).
7. **Web UI**: React SPA (Next.js or Vite) with Tailwind/shadcn — dashboards for graph, orphans, policies, console.

**Data Stores:**
- **Neo4j (or Neptune)**: Primary graph (Humans, Agents, Edges with properties: created_on, scope_snapshot, justification, risk_score).
- **PostgreSQL**: Relational metadata (tenants, environments, policies, audit events, user sessions).
- **Redis**: Caching (policy decisions, Entra tokens, recent agent metadata), rate limiting.
- **Object Storage (Azure Blob)**: Exported lineage snapshots, audit bundles (immutable).

---

## 4. Detailed Layer Mapping (to 5-Layer Vision)
**Layer 1: Shadow Org Graph**
- Components: Ingestion Service + Graph Service + Neo4j.
- Data flow: HRIS full sync (initial) + incremental (webhook on termination/promotion) + Microsoft incremental (Dataverse change feed or 5-min poll + Entra delta queries).
- Key queries: "All agents under terminated human subtree", "Agents with scope > parent's current entitlements", "Orphan agents by business unit".

**Layer 2: Credential Clone / Scope Engine**
- MVP: On agent create/update, snapshot parent's entitlements (Entra groups + HRIS roles + SharePoint access via Graph) and store on Agent node as `scope_snapshot` (JSON).
- Enforcement: Policy Engine compares requested scope (from Dataverse botcomponent or knowledge sources) against snapshot. Flag or block creation if violation.
- Future: Token Exchange (RFC 8693) via Entra to issue derivative agent creds capped at parent.

**Layer 3: API Brokerage Gateway (Runtime Stub for MVP)**
- Implementation: FastAPI app that exposes a proxy endpoint (e.g., `/proxy/action/{action_id}`) or MCP server.
- Flow for demo: Copilot Studio action → configured to call Pedigree proxy → lookup agent in graph → get parent human → evaluate policy (scope + SoD) → allow (forward to real backend) or block (return 403 with explanation) → log decision with full context.
- For real Microsoft actions: Either (a) customer configures custom connector to point at Pedigree, or (b) Entra Conditional Access + claims enrichment (Pedigree as claims provider — stretch for MVP).
- MCP path: If customer uses Dataverse MCP server or emerging Microsoft MCP support, Pedigree registers as policy-aware MCP gateway.

**Layer 4: App Owner Console**
- UI: Dedicated section or separate portal.
- Backend: Resource connectors (Microsoft Graph for SharePoint sites, Dataverse metadata API) + mapping table (resource_id → list of agent_ids that reference it).
- Actions: Revoke → call reassign API or set bot.statecode=Inactive + notify human owner via Graph/Teams.

**Layer 5: SoD & DLP Runtime (Stub)**
- MVP: Hard-coded or simple matrix rules in Policy Engine (e.g., "Finance human cannot own agent that calls both 'CreateVendor' and 'ApprovePayment' topics").
- Logging only for DLP (no redaction yet).
- v1.1: Integrate Microsoft Purview sensitivity labels + full DLP engine (or open-source like Presidio).

---

## 5. Technology Stack & Justifications (MVP)
- **Backend:** Python 3.12 + FastAPI (async, great DX, auto OpenAPI) + Pydantic v2.
- **Graph DB:** Neo4j Community / Aura (excellent Cypher for subtree/cascade queries; easy visualization).
- **Relational:** PostgreSQL 16 (ACID for audit, tenants, policies).
- **Cache/Queue:** Redis (BullMQ or native for jobs).
- **Frontend:** React 18 + Vite + Tailwind + shadcn/ui + TanStack Query (for API) + React Flow (for org/agent graph viz).
- **Auth:** FastAPI-Users + Entra OIDC (python-multipart, authlib).
- **Observability:** OpenTelemetry + Prometheus + Grafana (or Azure Monitor).
- **Deployment:** Azure Container Apps or AKS (easy Entra integration, scaling). IaC with Terraform/Bicep.
- **CI/CD:** GitHub Actions → build, test, deploy to staging/prod per tenant.
- **Why this stack?** Fast to build MVP, excellent Microsoft integration (Entra SDKs, Graph SDK), strong typing, great for policy/graph workloads, low operational overhead for early stage.

---

## 6. Scalability & Resilience (MVP → Post-MVP)
**MVP Targets:** 1 customer tenant, 5k–10k agents, 50k humans, 100k policy evals/day.
- Ingestion: Horizontal via multiple workers + Redis queue.
- Graph: Neo4j cluster (or serverless Aura) — queries optimized with indexes on owner_id, created_on, business_unit.
- Runtime: Stateless FastAPI — auto-scale; circuit breakers for downstream (Dataverse, Graph).
- Data: Tenant-isolated schemas/namespaces; PITR backups.

**Post-MVP (v1.1+):**
- Multi-region active-active (Azure Front Door).
- Full MCP gateway (production-grade, sub-5ms p99, WAF integration).
- OPA sidecar for complex policies.
- Event sourcing for full audit replay.
- Cost controls: Serverless where possible (Azure Functions for ingestion workers).

---

## 7. Security Architecture (High-Level — see dedicated Security doc)
- **Identity:** All human access via Entra OIDC + RBAC (no passwords). Service-to-service via managed identities or short-lived Entra tokens.
- **Network:** Private endpoints for all Azure resources; no public ingress except UI (behind WAF + Entra Conditional Access).
- **Data Protection:** Encryption at rest (Azure Disk/Key Vault), in transit (TLS 1.3). PII minimization (store only lineage metadata + hashes where possible).
- **Policy Enforcement:** Defense-in-depth — creation-time checks + runtime stub + Entra CA where applicable.
- **Compliance:** SOC2 Type I target for MVP; audit logs immutable + exportable; data residency per customer tenant.

---

## 8. Key Design Decisions & Trade-offs
- **Graph DB choice:** Neo4j over Amazon Neptune or custom Postgres JSONB because Cypher is far superior for "subtree under human + all descendants on termination" queries and visualization.
- **Runtime for MVP:** Proxy/stub instead of full inline gateway because full production gateway requires deeper MCP/connector integration and latency SLAs we can't guarantee in 90 days. Proxy proves the concept and can evolve to sidecar or MCP broker.
- **Scope snapshot vs live query:** Snapshot at creation + periodic refresh (daily) for performance and to freeze "intended" scope. Live query on every check would be too slow/expensive at scale.
- **HRIS as source of truth:** Even if Entra has manager data, we always reconcile to HRIS on every sync. This is our moat.

---

## 9. Open Questions / Future Work (post-MVP)
- Full MCP gateway performance & protocol compliance.
- Agent-to-agent delegation chains (multi-agent systems).
- Predictive "what-if" simulation for reorgs.
- Self-service agent creation portal with auto-scope calculation.
- Marketplace packaging + billing.
- Support for non-Microsoft agents (LangChain, custom, Zapier) via generic MCP/REST ingestion.

---

**This architecture directly enables every MVP user story while keeping the door open for the full 5-layer vision.** Engineering can now decompose into services, define interfaces, and start spiking.

Next: Detailed Data Model, API Spec (OpenAPI), Security & Threat Model, Test Plan, and Infrastructure as Code outline.