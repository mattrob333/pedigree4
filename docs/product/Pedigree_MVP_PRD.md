# Pedigree MVP Product Requirements Document (PRD)
**Version:** 1.0  
**Date:** April 27, 2026  
**Status:** Ready for Engineering  
**Scope:** MVP focused on Microsoft Copilot Studio + Entra-heavy enterprises (Wesco-style design partner PoC). 90-day delivery target.  
**Goal:** Deliver the core "Human Org Chart for AI Agents" value: automated discovery/attribution of agents, lineage graph, HR-tied lifecycle (cascade deprovision), basic runtime policy enforcement stub, and app-owner visibility — enough to unblock safe Copilot Studio adoption.

---

## 1. Problem Statement & North Star
**Problem:** Enterprises adopting Copilot Studio / M365 Copilot agents have no governance layer. Agents lack human ownership attribution, scope caps, SoD enforcement, lifecycle tied to HR events, and runtime controls. Result: rogue agents, compliance gaps, blocked AI productivity.

**North Star for MVP:** Every Copilot Studio agent in the customer's environment is automatically attributed to its human creator/owner from the live HRIS org chart. When the human leaves, the agent's subtree is deprovisioned. Basic scope and SoD policies are enforceable at creation and (stub) runtime. App owners gain visibility and one-click revoke.

**Success Metrics (MVP):**
- 100% of existing + new Copilot Studio agents attributed to a live HRIS human (or flagged as orphan) within 24h of discovery.
- Successful end-to-end cascade deprovision on simulated HR termination (reassign + disable + audit log).
- <10ms added latency on policy checks for demo actions.
- Design partner (Wesco) signs off on PoC success criteria and provides reference quote.
- Zero critical security findings in internal pen-test.

---

## 2. Target Personas & User Stories (MVP)
**Primary: Head of IAM / CISO (Technical Buyer)**
- "I can see every Copilot Studio agent, who owns it in the org chart, and its risk score."
- "When someone leaves, all their agents are automatically cleaned up with full audit trail."
- "I can set basic SoD rules that apply to agents the same way they apply to humans."

**Secondary: App Owner (e.g., SharePoint/Dataverse Owner)**
- "I see exactly which agents (with human owners) access my systems and can revoke one-click."

**Tertiary: Business User / Agent Maker**
- "When I create an agent in Copilot Studio, it automatically gets attached to me with the right scope."

**MVP User Stories (Epic → Stories):**

**Epic 1: Discovery & Attribution (P0)**
- US1.1: As IAM admin, I can connect Pedigree to a Power Platform environment + Entra tenant so that all `bot` records are discovered via Dataverse API.
- US1.2: As system, on `bot` create/update, I automatically resolve the `ownerid` / `createdby` Entra AadUserId to a live HRIS Human and create/update the parent-child edge in the graph.
- US1.3: As IAM admin, I see an "Orphan List" of agents whose owner is inactive in HRIS or has no match, with one-click "Suggest Parent" (ML) or manual assign.
- US1.4: As system, I surface basic risk score per agent (scope breadth, age, no human parent, etc.).

**Epic 2: HR-Tied Lifecycle (P0)**
- US2.1: As HRIS (via webhook or scheduled sync), on employee termination event, Pedigree marks the human inactive and triggers cascade: reassign all child agents to "Compliance Archive" owner via Power Platform reassign API + set bot state to Inactive + log full lineage snapshot to SIEM.
- US2.2: As IAM admin, I can simulate termination in UI and preview the cascade impact (list of agents, new owner, audit entry).
- US2.3: As system, on reorg/promotion in HRIS, I update the human's position in the graph and re-evaluate inherited scope for child agents (no auto-reprovision yet — manual approval in v1.1).

**Epic 3: Scope & Basic Policy (P1)**
- US3.1: As IAM admin, when an agent is created/updated, I can define or inherit a "scope envelope" (capped at parent's entitlements snapshot) and see violations flagged.
- US3.2: As system, on agent create, I snapshot the creating human's entitlements (via Entra Graph + HRIS) and store as initial scope for the agent node.
- US3.3 (Stub): Basic policy engine evaluates simple rules at creation time (e.g., "no agent owned by Finance can have write access to Payments table").

**Epic 4: App Owner Console (P1)**
- US4.1: As SharePoint/Dataverse owner, I can connect my resource to Pedigree and see a list of agents (with human Pedigree lineage) that have it as knowledge source or action target.
- US4.2: As app owner, I can one-click "Revoke Access" → triggers reassign or disable of the agent + notification to human owner.
- US4.3: As IAM admin, I see aggregated view across all app owners and pending revokes.

**Epic 5: Runtime Stub + Demo (P2 for MVP)**
- US5.1: As demo user, I can trigger a sample Copilot Studio agent action (e.g., "create vendor record") through a Pedigree-protected gateway/proxy that checks parent human scope + basic SoD rule and allows/blocks with explanation.
- US5.2: As system, all runtime decisions are logged with full Pedigree context (human parent, policy evaluated, decision).

**Non-Functional (MVP):**
- Multi-tenant: Support 1–5 Power Platform environments per customer tenant.
- Performance: Discovery sync <5 min for 5k agents; policy eval <10ms p99.
- Security: SOC2-aligned logging, least-privilege Entra app, encryption at rest/transit.
- Usability: Web UI (React + Tailwind) with role-based access (IAM Admin, App Owner, Viewer).
- Integrations: HRIS (Workday/UKG/ADP via webhook or CSV for MVP), Entra ID, Dataverse, Power Platform reassign API, basic Microsoft Graph.

**Out of MVP Scope (explicitly deferred):**
- Full MCP gateway with production latency SLAs.
- Advanced SoD stateful sequence tracking across sessions.
- DLP redaction on LLM outputs.
- Self-service agent request portal.
- Multi-IdP support (Okta, Ping — Entra-first for MVP).
- Predictive risk scoring with ML.
- Full white-label / marketplace packaging.
- FedRAMP / high-trust compliance packs.

---

## 3. Feature Prioritization (MoSCoW for MVP)
**Must Have (Ship in 90 days):**
- Dataverse + Entra discovery & auto-attribution
- HRIS sync (webhook + manual upload for PoC)
- Parent-child graph with cascade deprovision via reassign API
- Orphan list + manual/suggested parenting
- Basic scope snapshot + creation-time policy check
- App owner console (SharePoint/Dataverse focus)
- Audit logging + SIEM export (JSON)
- Demo runtime stub (proxy for 2–3 sample actions)
- Role-based web UI + RBAC

**Should Have:**
- Entra Agent ID sync (sponsor + blueprint if GA)
- Risk scoring dashboard
- Simulation mode for terminations/reorgs
- Email notifications on orphan/cascade

**Could Have:**
- Power Automate flow templates for Dataverse webhooks
- Basic analytics (agent growth, risk trends)

**Won't Have (MVP):**
- Full inline production gateway
- Advanced DLP/SoD
- Custom policy language UI
- Marketplace / billing

---

## 4. Acceptance Criteria (High-Level)
- **AC1 (Discovery):** After connecting a test Power Platform env with 50+ agents, 100% are listed in Pedigree with correct human parent (or orphan flag) within 10 minutes.
- **AC2 (Lifecycle):** Simulate termination of a human who owns 5 agents → all 5 are reassigned via API, set Inactive, full lineage + decision log exported to test SIEM within 60 seconds.
- **AC3 (Scope):** Agent created by a human with "read-only Finance" entitlements cannot be granted "write Payments" scope at creation time (flagged + blocked in demo).
- **AC4 (Console):** App owner sees their resource in the list with 3 linked agents (human Pedigrees visible) and can successfully revoke one.
- **AC5 (Runtime Stub):** Sample action through proxy is blocked when it violates a test SoD rule tied to the agent's human parent role; decision logged with full context.
- **AC6 (Security):** No PII leakage in logs; all Entra tokens use least-privilege; internal pen-test passes with no critical/high findings.

---

## 5. Technical Assumptions & Constraints (MVP)
- **Primary Stack:** Python/FastAPI backend, React + shadcn/ui frontend, Neo4j (or Amazon Neptune) for graph, PostgreSQL for relational metadata, Redis for caching.
- **Auth:** Entra ID (OIDC + app permissions) for all customer tenants; Pedigree service principal per customer.
- **HRIS for PoC:** Workday REST API (or CSV upload + manual sync). Production will add UKG/ADP webhooks.
- **Dataverse:** Use official Web API + OData; support delegated + application auth.
- **Deployment:** Azure (AKS or Container Apps) for MVP; multi-region active-passive later.
- **Data Residency:** Customer data stays in their tenant/region; Pedigree processes only metadata + lineage graph (no raw agent prompts/knowledge unless opted-in for advanced features).
- **Limits:** MVP supports up to 10k agents / 50k humans per tenant; horizontal scaling planned post-MVP.

---

## 6. Risks & Mitigations (MVP)
- **Risk:** Dataverse webhook reliability or rate limits → **Mitigation:** Hybrid poll (every 5 min) + change tracking + exponential backoff; document fallback.
- **Risk:** Entra Agent ID still preview / changing → **Mitigation:** Build Dataverse + Entra user core first; make Agent ID sync optional/pluggable.
- **Risk:** Customer reluctance to grant broad Dataverse/Entra permissions → **Mitigation:** Least-privilege app registration wizard + granular scopes documented; start with read-only discovery, add reassign later.
- **Risk:** HRIS integration complexity (custom Workday fields) → **Mitigation:** Standard fields (email, employee ID, manager, termination date) for MVP; customer-specific mapping UI in v1.1.

---

## 7. Dependencies & External Interfaces
- **Must:** Microsoft Entra ID, Power Platform / Dataverse, HRIS (Workday for PoC), basic SIEM (Splunk/Sentinel export).
- **Nice-to-have for PoC:** Sample Copilot Studio agents with real actions (Graph, SharePoint, Dataverse), test Entra Agent ID registration.
- **Internal:** Graph DB (Neo4j), policy engine stub (OPA/Rego or simple Python rules for MVP), audit logger.

---

## 8. Release & Rollout Plan (MVP)
**Sprint 1–2 (Weeks 1–4):** Core platform skeleton + Dataverse connector + Entra user resolution + basic graph CRUD + RBAC UI.
**Sprint 3–4 (Weeks 5–8):** HRIS sync + cascade logic + reassign API integration + orphan management + scope snapshot.
**Sprint 5–6 (Weeks 9–12):** App owner console + basic policy engine + demo runtime proxy + audit/SIEM export + end-to-end testing + security review.
**Week 13:** PoC hardening, docs, training for design partner, go-live.

**Definition of Done for MVP:** All Must-Have stories pass ACs, pen-test clean, design partner demo successful, code + docs in repo, monitoring dashboards live.

---

**This PRD is the contract between Product and Engineering for the first 90 days.** All subsequent specs (Architecture, Data Model, API, etc.) must trace back to these user stories and acceptance criteria.

Next artifacts to produce from this PRD: High-Level Architecture, Data Model, API Spec, Security Model, Test Plan. 

Ready for the coding agent.