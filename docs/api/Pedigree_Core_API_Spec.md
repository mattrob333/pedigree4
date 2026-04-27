# Pedigree Core API Specification (MVP)
**Version:** 1.0  
**Date:** April 27, 2026  
**Format:** OpenAPI 3.1 inspired (full YAML/JSON in /api/openapi.yaml to be generated from code).  
**Base URL (MVP):** `https://api.pedigree.ai/v1` (or customer-specific `https://{tenant}.pedigree.ai/v1`)  
**Auth:** Entra OIDC (Bearer JWT) + RBAC. All endpoints require valid token with appropriate role/scope.

---

## 1. Authentication & Authorization
- **OIDC Flow:** Standard Authorization Code + PKCE for UI; Client Credentials for service-to-service (ingestion workers, runtime gateway).
- **Required Scopes (Entra App):** `api://pedigree/ingest`, `api://pedigree/policy`, `api://pedigree/admin`, `api://pedigree/app_owner`.
- **RBAC Roles (enforced in API Gateway):**
  - `iam_admin`: Full access (discovery, policy, cascade, settings).
  - `app_owner`: Read/revoke on resources they own.
  - `viewer`: Read-only dashboards.
- **Tenant Isolation:** Every request validated against `tenant_id` claim or header; cross-tenant access blocked.

---

## 2. Core Resource Endpoints (MVP)

### Humans (from HRIS + Entra enrichment)
**GET /humans**  
Query params: `status=active`, `department=Finance`, `search=Jane`, `limit=50`, `offset=0`  
Response: `{ "data": [Human objects], "total": 12450, "page": 1 }`

**GET /humans/{human_id}**  
Includes: direct reports (subtree), owned agents count, risk summary, entitlements snapshot.

**POST /humans/sync** (admin only)  
Trigger full or incremental HRIS sync. Returns job_id for polling status.

**GET /humans/{human_id}/agents**  
All agents (direct + transitive) owned by this human + descendants. Supports `include_inactive=true`.

### Agents
**GET /agents**  
Filters: `platform=copilot_studio`, `status=active|orphaned`, `owner_human_id=xxx`, `environment_id=xxx`, `risk_min=50`, `search=vendor`  
Response includes human lineage summary (parent name, department, manager).

**GET /agents/{agent_id}**  
Full details + current scope_snapshot + last_policy_decision + linked resources + full ancestry path (human → manager → ...).

**POST /agents** (internal / ingestion only)  
Create or upsert agent from Dataverse/Entra payload. Triggers policy evaluation.

**PATCH /agents/{agent_id}/reassign** (iam_admin)  
Body: `{ "new_owner_human_id": "uuid", "reason": "hr_termination" }`  
Triggers reassign API call to Power Platform + graph update + audit event.

**POST /agents/{agent_id}/disable**  
Sets status=inactive, calls Dataverse state update if possible, logs.

**GET /agents/orphans**  
Specialized list: agents with no live human parent or owner terminated >7 days ago. Includes "suggest_parent" ML hint (future).

### Policies (MVP: simple rules)
**GET /policies**  
List active policies with type (scope_cap, sod, lifecycle).

**POST /policies** (iam_admin)  
Create rule. Example body for SoD:
```json
{
  "name": "Finance SoD - Vendor + Payment",
  "type": "sod",
  "rule": {
    "forbidden_combinations": [
      ["CreateVendorRecord", "ApprovePayment"]
    ],
    "applies_to_roles": ["Finance Manager", "Finance Analyst"]
  },
  "enforcement": "block_creation"
}
```

**GET /policies/evaluate** (for testing)  
Query param: `agent_id=xxx` or inline scope JSON → returns decision + explanation.

### Resources (App Owner Console)
**GET /resources** (app_owner scoped)  
Resources the caller owns or has access to, with agent count and risk.

**GET /resources/{resource_id}/agents**  
Agents that access this resource + their human Pedigree (owner, department, risk).

**POST /resources/{resource_id}/revoke** (app_owner or iam_admin)  
Body: `{ "agent_ids": ["uuid1", "uuid2"], "reason": "unused" }`  
Triggers reassign/disable + notifications.

### Audit & Reporting
**GET /audit/events**  
Filters: `event_type=hr_termination_cascade|policy_violation|runtime_decision`, `from=2026-04-01`, `to=...`, `target_human_id=...`

**GET /audit/export** (iam_admin)  
Generate signed URL for full lineage snapshot or filtered events (JSON/CSV/Parquet). Used for SOX/audit evidence.

**POST /reports/risk**  
Generate PDF/CSV risk report: "Agents by human, by department, top violations, orphan trends".

### Runtime / Policy Decision (for gateway stub)
**POST /runtime/evaluate** (internal, high-throughput)  
Body: `{ "agent_external_id": "...", "action": "CreateVendorRecord", "context": {...} }`  
Returns: `{ "decision": "allow|block|escalate", "reason": "...", "policy_id": "...", "human_parent": {...} }`

**POST /runtime/log**  
Log a decision from external gateway/MCP (for audit completeness).

---

## 3. Webhook Endpoints (for Microsoft / HRIS)
**POST /webhooks/hris/termination** (Workday or customer-configured)  
Body: `{ "employee_id": "...", "termination_date": "...", "reason": "..." }`  
Triggers cascade job (async).

**POST /webhooks/dataverse/bot-created** (via Power Automate or plugin)  
Body: Dataverse change payload → triggers ingestion + attribution.

**POST /webhooks/dataverse/owner-changed**  
For reassign events → update graph edge.

---

## 4. Error Handling & Standards
- Standard RFC 7807 Problem Details for errors.
- Rate limiting: 1000 req/min per tenant for read; 100 for write/cascade (burst handled by queue).
- Pagination: Cursor-based for large lists (agents, audit).
- Idempotency: `Idempotency-Key` header for POST /reassign, /disable.
- Versioning: `/v1/` — breaking changes only in new major version.

---

## 5. Example OpenAPI Snippet (Key Endpoint)
```yaml
paths:
  /agents/{agent_id}/reassign:
    post:
      summary: Reassign agent ownership (triggers Microsoft reassign API)
      security:
        - EntraOIDC: [api://pedigree/admin]
      parameters:
        - name: agent_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                new_owner_human_id:
                  type: string
                  format: uuid
                reason:
                  type: string
                  enum: [hr_termination, manual, policy_violation]
              required: [new_owner_human_id, reason]
      responses:
        '202':
          description: Accepted - cascade job queued
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/JobStatus'
        '404':
          $ref: '#/components/responses/NotFound'
```

---

## 6. SDK & Client Libraries (Post-MVP but planned)
- Official Python SDK (`pedigree-sdk`) for ingestion workers and custom gateways.
- TypeScript SDK for frontend / custom UI extensions.
- OpenAPI generator for any language.

---

**This API surface is minimal but complete for the MVP PRD.** It enables the design partner PoC, internal tooling, and future expansion (MCP full gateway, self-service portal, advanced analytics).

Full machine-readable OpenAPI + Postman collection + SDK stubs will be generated from FastAPI code in the next sprint.

Next artifacts: Security & Threat Model, Test Plan (unit/integration/E2E + chaos for cascade), Infrastructure (Terraform + Bicep for Azure), sample migration files, and CI/CD pipeline definition.