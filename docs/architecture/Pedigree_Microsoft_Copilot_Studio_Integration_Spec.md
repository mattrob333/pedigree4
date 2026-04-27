# Pedigree × Microsoft Copilot Studio Integration Specification
**Version:** 1.0 (Deep Dive for Microsoft-Centric Customers)  
**Date:** April 27, 2026  
**Purpose:** Technical blueprint for plugging Pedigree into Microsoft 365 / Copilot Studio environments. Enables full human-org-chart lineage, ownership attribution, scope enforcement, lifecycle automation, and runtime governance for agents built in Copilot Studio (and related tools like Agent Builder in M365 Copilot).

This spec is based on official Microsoft documentation (Copilot Studio, Dataverse, Entra Agent ID, Power Platform APIs, Microsoft Graph) as of April 2026.

---

## 1. How Microsoft Builds Agents in Copilot Studio (and Related Products)

### Core Platform: Copilot Studio (Primary for Enterprise Agents)
- **Location**: https://copilotstudio.microsoft.com/ (standalone) or embedded in Microsoft 365 Copilot / Power Platform.
- **Creation Model**: Low-code / no-code graphical builder + natural language prompts + templates. Supports:
  - Declarative agents (instructions, knowledge sources, actions/tools).
  - Custom engine agents (more advanced orchestration, code extensions).
  - Topics (conversation flows), Generative Answers, Actions (connectors to 1,000+ services via Power Platform, custom APIs, Power Automate flows).
- **Storage**: **Dataverse** (Power Platform environment-specific). Agents are first-class "bot" records.
  - Full Copilot Studio agents: Rich metadata, components, ALM via solutions/environments.
  - "Copilot Studio Lite" or Agent Builder agents (in M365 Copilot): Lighter, sometimes Teams-manifest style; less API surface (recommend upgrading to full for governance).
- **Lifecycle**:
  - Create → Author (topics, knowledge, actions) → Test → Publish (to channels: Teams, web, mobile, custom) → Operate (analytics, monitoring via Agent 365 / Power Platform admin center).
  - ALM: Export/import solutions, environment strategies, deployment pipelines.
- **Key Entity**: `bot` (LogicalName: `bot`) in Dataverse.
  - Represents the agent/copilot.
  - Rich attribution fields (see Section 2).
- **Related**: `botcomponent` (topics, skills, knowledge sources, variables, actions), `connectionreference` (for tool scopes).

### Agent Builder in Microsoft 365 Copilot
- Simpler entry point for declarative agents directly in M365 Copilot chat.
- Stored differently (less Dataverse exposure); partial metadata via Microsoft Graph / Copilot APIs.
- Good for quick internal agents; limited for deep governance compared to full Copilot Studio.

### Entra Agent ID Layer (Complementary / Emerging Standard)
- **Microsoft Entra Agent ID** (preview as of 2026): Specialized identity framework for *any* AI agent (not just Copilot Studio).
  - Agents get **agent identities** (special service principals) via **agent identity blueprints** (templates defining kind, metadata, permissions, roles).
  - Supports **parent-child relationships** at the blueprint level for consistent policies across agent fleets.
  - **Sponsor**: Optional human user/group accountable for the agent (perfect hook for Pedigree).
  - Authentication: OAuth 2.0 / OIDC optimized for agents, federated credentials (creds on blueprint, not per-agent), MCP & A2A protocol support.
  - Governance: Agent 365 (observe, govern, secure at scale; Conditional Access, risk detection, lifecycle, audit logs).
  - Integration: Platforms like Copilot Studio *can* integrate to register agents here for unified Entra management.
- **Relevance to Pedigree**: Entra provides identity + basic sponsor/ blueprint lineage. Pedigree extends with **full HRIS org-chart depth**, strict inheritance, cascade deprovision on real HR events, and cross-system SoD.

**Sources**: Copilot Studio fundamentals, Dataverse bot entity ref, Entra Agent ID docs (what-is, agent-identities, platform).

---

## 2. How Microsoft Documents Human Team Members & Attribution

### Primary Human Attribution: Entra ID + Dataverse System Users
- **Every agent has explicit human ownership**:
  - `bot.ownerid` → `systemuser` record (or `team`).
  - `systemuser` maps 1:1 to **Microsoft Entra ID user** (via Object ID, UPN, email, AadUserId).
  - **Created By**: `bot.createdby` (systemuser who created the record).
  - **Modified By / Published By**: `bot.modifiedby`, `bot.publishedby` (full audit chain of humans who touched it).
  - **Delegate fields**: `createdonbehalfby`, etc., for service accounts acting on behalf of humans.
- **Ownership Management**:
  - **Reassign API** (Power Platform / Copilot Studio Admin API): `POST /copilotstudio/environments/{envId}/bots/{botId}/api/botAdminOperations/reassign`
    - Body: `{"NewOwnerAadUserId": "Entra-User-Object-ID"}`
    - Requires admin roles (Global Admin, Power Platform Admin, Environment Admin, AI Admin).
    - New owner gets Environment Maker permissions automatically.
    - Explicitly designed for orphaned agents (original owner left/changed roles).
  - Direct Dataverse: `PATCH /bots({botId})` with `"ownerid@odata.bind": "/systemusers({newSystemUserId})"`.
- **Other Human Context**:
  - **Makers & Roles**: Users need Environment Maker / AI Builder roles in the Power Platform environment to create/manage agents.
  - **Interacting Users**: Authenticate via Entra ID for personalized access (knowledge sources respect user permissions via Graph Search / sensitivity labels).
  - **Entra Agent ID Sponsor**: Optional human "sponsor" on the agent identity for accountability/incident response.
  - **Business Units / Teams**: `owningbusinessunit`, `owningteam` for org scoping.
- **Microsoft Graph Enrichment**:
  - Full user profile: `/users/{id}` (manager, department, jobTitle, licenses, group memberships).
  - Note: Entra "manager" is *not* authoritative for Pedigree (HRIS/Workday is source of truth); use for enrichment only.

**This is the golden hook**: Microsoft already tracks human creators/owners at the Dataverse + Entra level with AadUserId and systemuser links. No guesswork needed for attribution.

---

## 3. Pedigree Lineage & Pedigree Mapping Strategy

### Core Mapping Logic (Automated on Discovery / Create)
1. **Ingest Agent**:
   - Query Dataverse `bots` (with `$expand=ownerid($select=systemuserid,azureactivedirectoryobjectid,internalemailaddress,fullname),createdby,...`).
   - Or use Power Platform Admin APIs / Graph for broader visibility (including some M365 Copilot agents).
2. **Resolve Human Parent**:
   - Take `ownerid.azureactivedirectoryobjectid` or `internalemailaddress` / UPN.
   - Match to Pedigree HRIS graph: `Human.email == Entra.email OR Human.employeeId == ...` (or fuzzy ML on name + dept for edge cases).
   - Fallback: `createdby` or `publishedby` if owner is orphaned/inactive.
3. **Create / Update Pedigree Graph Edge**:
   - **Human (parent from HRIS)** --[CREATED_ON: createdon, OWNS, PARENT_OF, INITIAL_JUSTIFICATION: bot.description + instructions from botcomponent]--> **Agent (child)**.
   - Agent node attributes:
     - `external_id`: `botid` + EnvironmentId + "CopilotStudio"
     - `type`: "Microsoft.CopilotStudio" | "M365.AgentBuilder"
     - `entra_agent_id` (if registered in Entra Agent ID)
     - `owner_entra_object_id`
     - `scope_snapshot`: JSON of knowledge sources (SharePoint URLs, Dataverse tables, connectors), actions/tools, published channels, permissions at creation time.
     - `blueprint_id` / `sponsor_entra_id` (from Entra if available)
     - `status`: Active / Inactive (from statecode/statuscode)
     - `last_published`: publishedon + publishedby human
4. **Inheritance & Scope Cap**:
   - At creation/update: Snapshot parent's live entitlements (via HRIS + Entra Graph: groups, licenses, SharePoint access via Microsoft Search).
   - Agent effective scope ≤ parent's (enforced in Pedigree policy engine + runtime gateway).
5. **Entra Agent ID Synergy**:
   - If agent has Entra Agent Identity: Pull sponsor (human) + blueprint (template with kind/roles/permissions). Pedigree treats blueprint as "template parent" but HRIS human as authoritative owner.
   - Parent-child in Entra blueprints: Pedigree can sync/enhance with full org chart (e.g., apply policies down the human management chain).

**Result**: Every Copilot Studio agent gets a verifiable "Pedigree" — documented human parent, creation context, scope envelope, and place in the live org chart. Orphans surface automatically (owner inactive in HRIS or no match).

**Cascade Deprovision**: On HR termination (HRIS webhook → Pedigree):
- Mark agent inactive in graph.
- Optionally call reassign API (to a "compliance archive" user) or disable bot (statecode=1) + revoke Entra Agent ID creds if registered.
- Full audit trail exported to SIEM.

---

## 4. Pedigree as Plug-in: Technical Integration Architecture

### Authentication & App Setup (One-Time Tenant Config)
- Register Pedigree app in customer's Entra ID.
- Required API Permissions (admin consent):
  - **Dataverse / Power Platform**: `user_impersonation` or application permissions for environment-specific access; `CopilotStudio.AdminActions.Invoke` for reassign.
  - **Microsoft Graph**: `User.Read.All`, `Group.Read.All`, `Directory.Read.All`, `Reports.Read.All` (Copilot usage), future `/copilot` endpoints.
  - **Entra Agent ID / Agent 365**: Relevant scopes if exposed (preview).
- Service Principal with least-privilege; use managed identity where possible.
- Multi-environment support: Customer maps Power Platform environments to Pedigree tenants/orgs.

### Layer-by-Layer Plug-in Mapping

**Layer 1: Shadow Org Graph (Ingestion & Attribution)**
- **Connectors**:
  - Dataverse Web API (primary, OData v4): Scheduled sync (every 15-60 min) + webhooks/plugins on `bot` Create/Update/Delete/Assign (Power Automate flow or custom plugin triggers Pedigree ingestion endpoint).
  - Power Platform Admin API: Environments, roles, reassign.
  - Microsoft Graph + Entra: Users, groups, agent identities (when GA).
- **Events**:
  - Dataverse supports webhooks on entity changes (including owner change).
  - On `bot` create: Auto-attribute + create edge.
  - On owner change (reassign): Update parent in Pedigree graph + log.
- **ML Fallback**: For partial attribution (Lite agents), use usage logs (who chats most?) or instruction text analysis.

**Layer 2: Credential Clone Engine**
- On agent create/update: Call Entra Token Exchange (RFC 8693) or derive scoped creds based on parent's entitlements (e.g., limit SharePoint knowledge source to sites human can access).
- Register/sync with Entra Agent ID blueprint: Pedigree supplies HR-derived policies/roles to the blueprint.
- Derivative, not copies: Agent cannot request scopes human lacks.

**Layer 3: MCP-Aware / Microsoft API Brokerage Gateway**
- **Primary Intercept**: Since Copilot Studio agents use **actions/tools** (Power Automate flows, custom connectors, Graph calls, Dataverse), deploy Pedigree gateway as:
  - Sidecar / proxy for agent runtime endpoints.
  - Policy enforcement point in Entra (via Custom Claims / Token Validation) or MCP broker (Microsoft supports MCP in some agent scenarios; Dataverse MCP server mentioned in docs).
  - For Graph calls from agents: Entra Conditional Access + Pedigree PDP (Policy Decision Point) before token issuance.
- **Checks**:
  - Verify agent identity (Entra Agent ID or botid) → lookup parent human in Pedigree graph.
  - Enforce parent scope (e.g., "this action only if human's role allows").
  - SoD: Detect toxic sequences (e.g., "create vendor" topic + "approve payment" action by same lineage).
  - DLP: Classify/redact data in responses (integrate Microsoft Purview sensitivity labels).
- **Performance**: <5ms p99 via compiled policies + caching. Async for heavy SoD.

**Layer 4: App Owner Console (Microsoft-Flavored)**
- **Resources to Monitor**: SharePoint sites (knowledge sources), Dataverse tables, Power Automate flows, custom APIs, published channels (Teams teams/channels).
- **View**: "Which agents (with human owner + Pedigree lineage) access my SharePoint site / Dataverse table?"
- **Actions**: One-click revoke (call reassign or disable bot via API) + notify human owner.
- **Integration**: Microsoft Purview Data Map + Graph for resource owners; extend Pedigree console or embed in M365 admin centers via Graph connectors / SPFx.

**Layer 5: SoD & DLP Runtime Engines**
- Policy language: Map Copilot topics/actions to business processes (e.g., via taxonomy or ML on instructions).
- Evaluate in gateway (pre-execution) + post (audit).
- Rules authored in Pedigree UI or imported from existing IGA (Saviynt-style matrices extended to agents).
- Entra Agent ID + Agent 365: Feed Pedigree policies into native Conditional Access / governance for scale.

### Data Flow Example (Agent Creation)
1. Maker (Human in HRIS + Entra) creates agent in Copilot Studio.
2. Dataverse `bot` record created → webhook / poll → Pedigree ingests.
3. Resolve parent Human via Entra Object ID → HRIS match.
4. Create graph edge + snapshot scope.
5. (Optional) Register agent identity in Entra Agent ID with Pedigree-supplied sponsor + policies.
6. Runtime: Agent action call → Pedigree gateway → policy check (parent scope + SoD) → allow/ block / redact → log to audit.

---

## 5. Demo PoC for Microsoft Customer (e.g., Wesco or Similar F500)
**Goal (90 days or less)**: Show "Copilot Studio unblocked with full Pedigree governance."

**Setup**:
- Customer provides: Power Platform environment(s) with sample agents, Entra tenant access (app registration), HRIS sample data (or synthetic), sample SoD matrix.
- Pedigree deploys: Dataverse connector + basic gateway (proxy for 1-2 sample actions) + console extension.

**Demo Script** (15-20 min):
1. **Discovery**: Show Pedigree dashboard — "Here are all your Copilot Studio agents, auto-attributed to human creators/owners from Entra + HRIS. 12 orphans surfaced (owners left company)."
2. **Lineage Deep Dive**: Pick an agent → "Created by Jane Doe (Finance Manager, reports to VP) on 2026-03-15. Initial scope: Read-only on Contoso SharePoint + 3 Dataverse tables. Inherited from Jane's entitlements (capped — no write/delete)."
3. **Lifecycle Magic**: Simulate "Jane leaves" (HRIS termination event) → Pedigree triggers reassign API to "Archive Owner" + disables agent + full audit export. "Zero rogue agents."
4. **Runtime Enforcement**: Trigger a sample agent action that would violate SoD (e.g., create + approve in same lineage) → Gateway blocks with explanation + escalates to human owner. Show <5ms latency.
5. **App Owner View**: Log in as SharePoint site owner → "These 7 agents (with human Pedigrees) access my site. Revoke access for Agent X (owned by terminated user)."
6. **Value**: "You can now safely scale Copilot Studio / Agent Builder across the enterprise. Productivity unblocked, compliance satisfied, no new headcount for manual cleanup."

**Success Metrics for PoC**:
- 100% attribution accuracy on existing agents.
- Successful reassign on simulated termination.
- Runtime policy blocks on test SoD violation.
- Customer admin can self-serve reassign/orphan cleanup via Pedigree console.

**Pricing Tease**: Discovery free → Management $X/agent/mo (includes runtime for premium tier).

---

## 6. Gaps, Risks & Recommendations

**Strengths of Microsoft Stack for Pedigree**:
- Explicit ownership (`ownerid`, `createdby`, AadUserId) — easiest attribution of any platform.
- Reassign API designed exactly for our "HR event → cleanup" use case.
- Entra Agent ID + blueprints + sponsor: Native support for some lineage concepts (we extend it).
- MCP / Dataverse MCP server mentions: Runtime intercept path exists or is coming.
- Graph + Dataverse APIs: Mature, well-documented.

**Gaps / Risks**:
- **Entra Agent ID Preview**: Full GA timeline unknown; sponsor/ blueprint features may evolve. Pedigree works today on Dataverse + Entra users regardless.
- **Agent Builder / Lite Agents**: Limited Dataverse exposure. Push "full Copilot Studio" for governed agents or use partial Graph metadata.
- **Runtime Interception**: No single "agent runtime proxy" yet. Options: (a) MCP broker (emerging), (b) Entra token validation hooks, (c) custom connector middleware for actions, (d) sidecar for Azure-hosted agents. Start with policy-as-code for actions + Entra CA.
- **Webhooks Maturity**: Dataverse webhooks exist but require plugin registration or Power Automate. MVP uses reliable polling + change tracking.
- **Cross-Tenant / Multi-Env**: Handle via customer config mapping.
- **Native Competition**: Agent 365 / Entra expanding governance. Pedigree wins on **HRIS depth + strict org-chart inheritance + full SoD across human + agent actions + app-owner empowerment**.

**Recommendations for Build**:
1. **MVP Scope (4-6 weeks)**: Dataverse connector + Entra user resolution + basic graph + reassign trigger on HR events + simple console. No runtime yet.
2. **v1.1**: Add MCP / action gateway stub + Entra Agent ID sync (when GA).
3. **Partnership Angle**: Microsoft ISV program, co-sell with Copilot Studio / Power Platform partners, reference in Agent 365 docs.
4. **Differentiation Messaging**: "Microsoft gives you agent identities and basic ownership. Pedigree gives you the *human org chart* as the single source of truth — with automatic lifecycle, scope caps, and runtime controls that survive reorgs and leavers."
5. **Compliance**: SOC2, ISO alignment; export lineage for SOX/audit ( "show me every agent owned by terminated employee X").

---

## Appendix: Key API Endpoints & Schema Snippets

**Dataverse Bot Query Example** (OData):
```
GET /api/data/v9.2/bots?$select=botid,name,createdon,statecode,statuscode,ownerid,createdby,publishedby&$expand=ownerid($select=azureactivedirectoryobjectid,internalemailaddress,fullname),createdby($select=azureactivedirectoryobjectid)
```

**Reassign Example**:
```
POST https://api.powerplatform.com/copilotstudio/environments/xxx/bots/yyy/api/botAdminOperations/reassign?api-version=1
Authorization: Bearer <Entra token>
{"NewOwnerAadUserId": "aaaaaaaa-1111-2222-3333-bbbbbbbbbbbb"}
```

**Entra Agent Identity (Graph reference)**: Agent identities appear as specialized objects; full schema in Microsoft Graph docs (object ID, sponsor, blueprint link).

**Mermaid Diagram Idea** (for deck):
```
graph TD
    HRIS[HRIS<br/>Workday/UKG] -->|Termination| Pedigree[Pedigree Graph]
    Entra[Entra ID Users] -->|AadUserId match| Pedigree
    Dataverse[Dataverse bot<br/>ownerid / createdby] -->|Ingest| Pedigree
    Pedigree -->|Reassign API| CopilotStudio[Copilot Studio]
    Pedigree -->|Policy Check| Gateway[Pedigree MCP/ Entra Gateway]
    AgentAction[Agent Action<br/>Graph / Connector] --> Gateway
    Human[Human Maker] -->|Creates| CopilotStudio
```

This spec is production-ready for engineering. Next: Implement Dataverse connector prototype, then full PoC with customer data.

**Pedigree wins Microsoft shops by making their native ownership hooks *HR-authoritative and runtime-enforceable* at org-chart scale.** 

Contact for questions or to schedule architecture review.