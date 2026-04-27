# Pedigree Data Model & Schema Specification
**Version:** 1.0  
**Date:** April 27, 2026  
**Purpose:** Authoritative schema for the Shadow Org Graph (primary) + supporting relational store. Enables all MVP user stories (discovery, lineage, cascade, scope, policy).

---

## 1. Design Principles
- **Graph-First for Lineage:** Neo4j (or compatible) is the source of truth for human-agent relationships, subtree queries, and cascade logic. Cypher is expressive for "all descendants of a terminated human".
- **Relational for Metadata & Audit:** PostgreSQL for tenants, policies, audit events, RBAC, configuration — ACID + strong querying.
- **Hybrid:** Graph nodes/edges contain denormalized snapshots for fast policy evaluation; relational holds full history and configuration.
- **Tenant Isolation:** Every node/row has `tenant_id`. Queries always filter by it.
- **Immutability for Audit:** Core lineage events (creation, ownership change, termination cascade) are append-only with timestamps and actor.
- **Extensibility:** JSONB / node properties for future fields (e.g., Entra Agent ID blueprint, custom attributes).

---

## 2. Graph Schema (Neo4j / Property Graph)

### Node Labels & Properties

**`:Human` (from HRIS — source of truth)**
- `human_id`: UUID (internal Pedigree surrogate, primary key)
- `tenant_id`: UUID
- `external_id`: HRIS employee ID or Workday ID (unique per tenant)
- `email`: String (primary match key)
- `upn`: String (Entra UPN for matching)
- `full_name`: String
- `department`: String
- `job_title`: String
- `manager_id`: UUID (self-reference to another `:Human` — builds the org chart tree)
- `status`: 'active' | 'terminated' | 'on_leave' | 'pending'
- `termination_date`: DateTime (nullable)
- `entitlements_snapshot`: JSON (groups, roles, licenses, SharePoint access at last sync — refreshed daily)
- `created_at`, `updated_at`: DateTime
- `source`: 'workday' | 'ukg' | 'adp' | 'manual' | 'entra'

**`:Agent` (any AI agent — MVP focus on Copilot Studio)**
- `agent_id`: UUID (Pedigree surrogate)
- `tenant_id`: UUID
- `external_id`: String (e.g., "dataverse:envId:botId" or Entra Agent ID object ID)
- `platform`: 'copilot_studio' | 'm365_agent_builder' | 'entra_agent_id' | 'langchain' | 'custom' (MVP: copilot_studio + entra_agent_id)
- `name`: String
- `description`: String (from bot instructions or metadata)
- `status`: 'active' | 'inactive' | 'orphaned' | 'pending_deprovision'
- `created_at`, `updated_at`, `last_published_at`: DateTime
- `owner_human_id`: UUID (FK to :Human — the Pedigree parent)
- `scope_snapshot`: JSON (knowledge sources, actions/tools, connectors, permissions at creation/refresh)
- `justification`: String (free-text or from bot metadata)
- `risk_score`: Float (0–100, computed: scope_breadth + age + no_human_parent + policy_violations)
- `entra_agent_object_id`: String (nullable — if registered in Entra Agent ID)
- `blueprint_id`: String (nullable — Entra blueprint)
- `sponsor_entra_id`: String (nullable — from Entra Agent ID)
- `environment_id`: String (Power Platform env for Copilot Studio agents)
- `last_policy_check_at`: DateTime
- `last_policy_decision`: JSON (result of last scope/SoD check)

**`:Resource` (for App Owner Console — MVP: SharePoint sites, Dataverse tables)**
- `resource_id`: UUID
- `tenant_id`: UUID
- `external_id`: String (Graph site ID or Dataverse logical name + env)
- `type`: 'sharepoint_site' | 'dataverse_table' | 'power_automate_flow' | 'custom_api'
- `name`: String
- `owner_human_id`: UUID (optional — app owner from Microsoft)
- `last_scanned_at`: DateTime

### Relationship Types (Edges)

**`:CREATED` (Human → Agent)**
- Properties: `created_at`, `justification`, `initial_scope_hash` (for audit)

**`:OWNS` / `:PARENT_OF` (Human → Agent) — current authoritative ownership**
- Properties: `assigned_at`, `assigned_by_human_id`, `scope_cap` (JSON or reference)

**`:MANAGES` (Human → Human) — org chart hierarchy from HRIS**
- Properties: `relationship_type`: 'direct_manager' | 'dotted_line' (for matrix orgs)

**`:ACCESSES` (Agent → Resource)**
- Properties: `access_type`: 'read' | 'write' | 'admin', `granted_at`, `via_knowledge_source` | `via_action`

**`:VIOLATES` (Agent → Policy) — for flagging**
- Properties: `policy_id`, `detected_at`, `severity`

**`:DEPROVISIONED` (Human → Agent) — historical, immutable**
- Properties: `deprovisioned_at`, `reason`: 'hr_termination' | 'manual' | 'policy_violation', `new_owner_human_id`, `audit_bundle_id`

**Indexes (Critical for Performance):**
- Human: `tenant_id + email`, `tenant_id + external_id`, `tenant_id + manager_id`
- Agent: `tenant_id + external_id`, `tenant_id + owner_human_id`, `tenant_id + status`
- Full-text on Agent.name + description for search
- Composite for cascade: `tenant_id + owner_human_id + status`

**Example Cypher for Cascade (Termination):**
```cypher
MATCH (h:Human {tenant_id: $tenant, external_id: $terminatedId})
OPTIONAL MATCH (h)-[:PARENT_OF*1..]->(a:Agent {status: 'active'})
SET a.status = 'pending_deprovision',
    a.updated_at = datetime()
WITH a
CALL {
  WITH a
  MATCH (newOwner:Human {tenant_id: $tenant, email: 'compliance-archive@contoso.com'})
  CREATE (newOwner)-[:OWNS {assigned_at: datetime(), reason: 'hr_termination'}]->(a)
  RETURN count(*) AS reassigned
}
RETURN count(a) AS agents_affected
```

---

## 3. Relational Schema (PostgreSQL)

**Core Tables (abbreviated — full DDL in /migrations)**

**`tenants`**
- `tenant_id` UUID PK
- `name` String
- `entra_tenant_id` String (unique)
- `hris_type` 'workday' | 'ukg' | ...
- `hris_config` JSONB (endpoint, auth method, field mappings)
- `created_at`, `updated_at`

**`environments` (Power Platform / Copilot Studio)**
- `environment_id` UUID PK
- `tenant_id` FK
- `external_id` String (Power Platform env ID)
- `name` String
- `dataverse_url` String
- `last_sync_at` DateTime
- `status` 'active' | 'error'

**`policies` (MVP: simple rules; later Rego)**
- `policy_id` UUID PK
- `tenant_id` FK
- `name` String
- `type`: 'scope_cap' | 'sod' | 'dlp' | 'lifecycle'
- `rule` JSONB (e.g., {"scope": {"max_write_tables": 0}, "sod": ["CreateVendor", "ApprovePayment"]})
- `enabled` Boolean
- `created_by_human_id` UUID
- `created_at`

**`audit_events` (immutable append-only)**
- `event_id` UUID PK (or ULID for time-order)
- `tenant_id` FK
- `event_type`: 'agent_created' | 'ownership_changed' | 'hr_termination_cascade' | 'policy_violation' | 'runtime_decision' | ...
- `actor_human_id` UUID (nullable)
- `target_agent_id` UUID (nullable)
- `target_human_id` UUID (nullable)
- `payload` JSONB (full context: old/new values, policy result, etc.)
- `occurred_at` DateTime (indexed)
- `source`: 'ingestion' | 'policy_engine' | 'runtime_gateway' | 'hris_webhook' | 'manual'

**`agent_resource_mappings` (for App Owner Console)**
- `mapping_id` UUID PK
- `tenant_id` FK
- `agent_id` UUID (Pedigree agent_id or external)
- `resource_id` UUID
- `access_type` String
- `discovered_at` DateTime
- `last_confirmed_at` DateTime

**`rbac_roles` / `rbac_assignments`** (standard user/role/permission for Pedigree UI)

**Views / Materialized:**
- `v_active_agents_with_human`: JOIN Agent + Human for fast dashboard queries.
- `v_orphan_agents`: Agents where owner_human_id IS NULL or linked Human.status != 'active'.

---

## 4. Data Flow & Transformation Rules (MVP)

**HRIS → Human Node (full sync initial, incremental daily + webhook on termination):**
- Map standard fields (email, employee_id, manager_employee_id, department, job_title, status, termination_date).
- Build `:MANAGES` edges from manager_id.
- Refresh `entitlements_snapshot` via Entra Graph (groups + licenses) + customer-provided mapping.

**Dataverse `bot` → Agent Node:**
- `external_id` = `f"dataverse:{environment_id}:{bot.botid}"`
- `owner_human_id` = resolve(bot.ownerid.azureactivedirectoryobjectid → Human by upn/email)
- `created_at` = bot.createdon
- `scope_snapshot` = {
  "knowledge_sources": [from botcomponent or metadata],
  "actions": [connectors + custom],
  "published_channels": [...]
}
- `justification` = bot.description or first 500 chars of instructions (from botcomponent)

**Entra Agent ID → Agent Node (optional sync):**
- If `entra_agent_object_id` present → enrich with sponsor, blueprint, status.

**Policy Evaluation on Create/Update:**
1. Lookup parent Human + current entitlements.
2. Compare against agent's requested scope_snapshot.
3. Run active `policies` of type 'scope_cap' / 'sod'.
4. Write decision to `audit_events` + update Agent.last_policy_decision + risk_score.
5. If violation and strict mode → block (for creation) or flag (for existing).

---

## 5. Example JSON Snapshots

**Agent Node (simplified):**
```json
{
  "agent_id": "550e8400-e29b-41d4-a716-446655440000",
  "tenant_id": "...",
  "external_id": "dataverse:contoso-prod:12345678-90ab-cdef-1234-567890abcdef",
  "platform": "copilot_studio",
  "name": "Vendor Onboarding Assistant",
  "owner_human_id": "human-uuid-finance-manager",
  "scope_snapshot": {
    "knowledge_sources": ["https://contoso.sharepoint.com/sites/Finance", "Dataverse:contoso:vendors"],
    "actions": ["CreateVendorRecord", "SearchVendor"],
    "max_permissions": ["read:finance", "write:vendors-temp"]
  },
  "justification": "Created by Jane Doe to automate vendor intake per Q2 initiative",
  "risk_score": 42.5,
  "status": "active"
}
```

**Audit Event (Termination Cascade):**
```json
{
  "event_type": "hr_termination_cascade",
  "actor_human_id": null,
  "target_human_id": "human-uuid-jane-doe",
  "payload": {
    "terminated_human": {...},
    "agents_affected": 7,
    "new_owner": "compliance-archive@contoso.com",
    "reassign_api_calls": [...],
    "policy_decisions": [...]
  },
  "occurred_at": "2026-04-27T14:22:00Z"
}
```

---

## 6. Migration & Seeding Strategy
- **Initial Load:** Full HRIS export (CSV or API) → bulk create Human + :MANAGES edges.
- **Dataverse Backfill:** One-time query all bots → create Agent nodes + resolve owners (flag orphans).
- **Ongoing:** Incremental via webhooks/polling with last_sync watermark in `environments` table.
- **Idempotency:** Upsert on `external_id` + `tenant_id`; never duplicate nodes.

---

## 7. Query Performance Targets (MVP)
- Subtree query (cascade): <200ms for 5k agents under one human.
- Orphan list: <1s for 10k agents.
- Policy check (creation): <10ms p99 (cached entitlements + simple rules).
- Dashboard (active agents + risk): <500ms with materialized views or Redis cache.

**Indexes + Constraints** documented in `/db/neo4j/constraints.cyp` and `/db/postgres/schema.sql` (to be created in next artifact).

---

**This schema is production-ready for the MVP.** It directly supports every user story in the PRD while remaining extensible for the full vision (MCP, multi-agent, predictive analytics, etc.).

Next files: Core API Specification (OpenAPI 3.1), Security & Threat Model, Test Plan, Infrastructure (Terraform/Bicep), and sample Cypher/Postgres migration files.