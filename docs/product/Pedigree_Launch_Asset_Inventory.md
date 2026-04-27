# Pedigree Launch Asset Inventory
**Project:** Pedigree – The Human Org Chart for AI Agents (formerly Shadow Org)  
**Date:** April 19, 2026  
**Status:** Phase 0 – Alignment & Foundation  
**Owner:** [Founder / Product Lead]  
**Teams:** Builders (Engineering + Product), Marketers (GTM + Content), Internal (Leadership + All-Hands)

## Executive Summary
This inventory lists **every document, spec, explainer, deck, and asset** required to take Pedigree from concept to first customer (Wesco design partner PoC) and then to general availability. It is organized by phase and audience so teams can execute in parallel without thrashing.

The platform treats every AI agent as a **child node** under a human creator in the live HRIS org chart. Agents inherit a strict subset of the parent's entitlements, report through the parent's management chain, and are automatically deprovisioned on HR termination events. This single design choice solves ownership, scope, SoD, lifecycle, runtime enforcement, and audit gaps that no existing vendor fully addresses.

**Core Differentiator (The Moat):** The authoritative **human-to-agent lineage graph** wired directly to HRIS + real-time parent-scope enforcement. Microsoft Entra Agent ID, Veza, Britive, and PlainID are shipping pieces; none own the org-chart source of truth with cascade deprovision and strict inheritance.

---

## Phase 0: Alignment & Foundation (Week 1–2 | Internal + Leadership)
**Goal:** Get the entire team (and design partner) aligned on name, vision, positioning, and MVP scope before any code is written.

1. **Pedigree Name Finalization + Rationale** (This doc)  
   - Why "Pedigree", alternatives considered, trademark/domain check notes, internal vote.

2. **Internal Vision & Strategy Brief** (2–4 pages)  
   - Problem, thesis, why now (2026 market timing with Entra Agent ID + MCP), 5-layer architecture summary, moat, GTM wedge ("Unblock safe agentic AI in 90 days"), success metrics, risks & assumptions.

3. **Product Vision Document (PVD)** (Longer form, 8–12 pages)  
   - Detailed "North Star", target personas (CISO, Head of IAM, App Owner, Business User, IGA Team), 18-month roadmap themes, competitive landscape snapshot (Microsoft, Veza, Britive, PlainID, Kong MCP Gateway, etc.).

4. **Core Positioning & Messaging Framework**  
   - Value proposition, key messages by persona, proof points, "elevator pitch", taglines, brand voice guidelines.

5. **MVP Scope Definition & Success Criteria**  
   - What ships in first release (Discovery + Graph ingest + basic parent attribution + Entra integration + simple gateway stub + Wesco PoC flows). Explicit "not in MVP" list. OKRs for PoC.

6. **Risk Register & Assumptions Log**  
   - Technical (latency, MCP coverage, HRIS reliability), market (Microsoft bundling, pricing pressure), execution (team gaps), mitigation plans.

7. **All-Hands Team Briefing Deck** (15–20 slides)  
   - Visual summary of above for kickoff meeting. Includes org chart diagram, before/after agent lifecycle, competitive 2x2.

---

## Phase 1: Product & Technical Definition (Builders | Parallel with Phase 0)
**Goal:** Give engineering a complete blueprint so they can start architecture spikes and PoC coding immediately after alignment.

8. **Product Requirements Document (PRD) – MVP**  
   - User stories (epics: Agent Discovery & Attribution, Org Graph Management, Credential & Scope Enforcement, Runtime Gateway, App Owner Console, SoD/DLP Policies, Lifecycle Automation). Acceptance criteria, non-functional requirements (performance, security, multi-tenancy).

9. **High-Level Architecture Document**  
   - 5-layer overview with data flows, component diagram (Graph DB choice – Neo4j vs Amazon Neptune vs custom), integration points, authz model (OAuth 2.1 + Token Exchange RFC 8693 + Entra Agent ID).

10. **Detailed Layer Specifications** (one per layer or combined)  
    - **Layer 1: Shadow Org Graph** – HRIS connectors (Workday, UKG, ADP, ServiceNow), entity model (Human, Agent, ManagerEdge, EntitlementSnapshot), versioning, cascade logic.  
    - **Layer 2: Credential Clone Engine** – Token Exchange flow, scope derivation rules, IdP integrations (Entra, Okta, Ping).  
    - **Layer 3: MCP-Aware API Brokerage Gateway** – Protocol support (MCP primary, REST, GraphQL, SOAP, DB drivers), policy evaluation engine, caching strategy, latency SLAs (<5ms p99 added).  
    - **Layer 4: App Owner Console** – UI flows, permissions, 30-day history, one-click revoke, export for audit.  
    - **Layer 5: SoD & DLP Runtime Engines** – Policy language (Rego? OPA? custom), stateful sequence tracking, data classification integration, redaction rules.

11. **Data Model & Schema** (ERD + Graph Schema)  
    - Entities, relationships, indexes, query patterns (e.g., "all agents under terminated human subtree").

12. **API Specification** (OpenAPI 3.1 + GraphQL schema + MCP extensions)  
    - Core endpoints for graph queries, agent registration, policy evaluation, console APIs. Auth, pagination, webhooks.

13. **Integration Specification Pack**  
    - HRIS (Workday REST + webhooks), Microsoft Entra Agent ID + Graph API, MCP Gateway patterns (Kong/Solo reference), ServiceNow/Oracle/SAP example connectors, SIEM export (Splunk, Sentinel).

14. **Security Architecture & Threat Model**  
    - STRIDE analysis, zero-trust principles, secrets management, audit logging requirements, compliance mapping (SOC 2, ISO 27001, SOX, GDPR).

15. **Performance, Scalability & Resilience Requirements**  
    - Target: 10k humans + 100k agents per tenant, 1M+ tool calls/day, 99.9% uptime, multi-region active-active considerations.

16. **MVP Technical Roadmap & Release Plan** (Phased sprints)  
    - Sprint 1–2: Discovery + Graph ingest + Entra sync.  
    - Sprint 3–4: Basic runtime enforcement stub + Wesco PoC flows.  
    - Sprint 5–6: App Owner Console MVP + SoD rules engine.  
    - Dependencies, milestones, definition of done.

17. **Test Strategy & QA Plan**  
    - Unit, integration, end-to-end (incl. chaos for HR termination cascades), security pen-test scope, load/performance tests.

---

## Phase 2: Go-to-Market & Sales Enablement (Marketers + Sales)
**Goal:** Have everything needed to sell the design partner PoC and prepare for broader launch.

18. **Sales Pitch Deck** (12–15 slides, investor + customer version)  
    - Problem (8 gaps), Market (NHI stats 2026), Solution (Pedigree thesis + 5 layers), Why Now, Traction (Wesco), Business Model, Team, Ask.

19. **One-Pager / Datasheet** (2-sided PDF)  
    - Key benefits, features, architecture diagram, pricing teaser, contact.

20. **Competitive Battlecard** (Living doc)  
    - Vs Microsoft Entra Agent ID + Agent 365, Veza AI Agent Security, Britive Agentic, PlainID Agentic, Kong/Solo MCP Gateways, Astrix/Entro/Token Security. Strengths/weaknesses, objection handling, "Pedigree wins when...".

21. **Pricing & Packaging Strategy**  
    - Discovery tier (free), Core (per agent/mo), Enterprise (unlimited + premium runtime/SOD/DLP + dedicated support). Contract ranges, discount levers, ROI model for customer.

22. **Design Partner / Case Study Playbook** (Wesco-first)  
    - Success metrics, PoC success criteria, reference story outline, quote collection process, NDA/templates.

23. **Website Content & Structure**  
    - Landing page hero + value props, Product page (5 layers deep dive), "How it Works" explainer, Resources (whitepaper, blog), Pricing, Contact.

24. **Thought Leadership & Content Plan** (First 90 days)  
    - Blog topics ("The Agent Org Chart is the New Source of Truth", "Why MCP Gateways Need Human Lineage", "SOX-Compliant Agent Governance in 2026"), LinkedIn/ X strategy, webinar series with design partner.

25. **Customer Journey Maps & Playbooks**  
    - Discovery → PoC → Onboard → Expand → Advocate. CS playbook for IAM teams and App Owners.

26. **ROI Calculator & Business Case Template** (Spreadsheet or interactive)  
    - Quantify risk reduction (audit findings avoided, breach cost avoided), productivity unlocked (agents unblocked), FTE savings.

---

## Phase 3: Explainers, Education & Thought Leadership
**Goal:** Make the complex concept instantly understandable and defensible.

27. **"How Pedigree Works" Technical Explainer** (Long-form article + diagrams)  
    - Step-by-step: HRIS ingest → Agent creation → Parent assignment → Scope derivation → Runtime check → Deprovision cascade. Mermaid or draw.io diagrams for each layer and full data flow.

28. **Whitepaper: "The Missing Primitive: Human Lineage as the Governance Layer for Agentic AI"** (8–12 pages, PDF)  
    - Market data, architectural consensus 2026, why org-chart-first beats flat NHI tagging, Pedigree architecture, Wesco validation, future vision (multi-agent systems, agent-to-agent delegation).

29. **Architecture Diagrams Pack** (High-res PNG/SVG + editable source)  
    - 5-Layer Overview, Runtime Enforcement Flow, Org Graph Example (with cascade), App Owner Console Mock, Before/After Agent Lifecycle.

30. **Glossary & Terminology Guide**  
    - NHI, MCP (Model Context Protocol), Token Exchange (RFC 8693), SoD, DLP, Entra Agent ID, Parent Scope, Cascade Deprovision, Orphan Agent, etc.

31. **FAQ – Customer & Internal Versions**  
    - 30+ questions: "How does this differ from Entra Agent ID?", "What about agents that must outlive their creator?", "Latency impact on agent performance?", "Pricing for 5,000 agents?", "Microsoft partnership plans?"

32. **Training & Enablement Materials**  
    - IGA Team Onboarding Guide, App Owner Quickstart, Business User "Create Your First Governed Agent" tutorial.

---

## Phase 4: Visuals, Demos, Legal & Operations
**Goal:** Production-ready assets and compliance foundation.

33. **Brand Kit** (Logo concepts, color palette, typography, iconography, illustration style – "clean enterprise tech with human warmth")

34. **UI/UX Wireframes & High-Fidelity Mockups** (Figma link or static exports)  
    - Key screens: Dashboard (agent inventory + risk), Org Graph Visualizer, App Owner Console, Policy Editor, Agent Detail (lineage + history).

35. **Demo Environment & Script** (For Wesco + sales)  
    - Synthetic data setup (fake HRIS + 50 agents), step-by-step demo flow, failure modes to show (orphan agent blocked, scope violation blocked, termination cascade).

36. **Explainer Video Script & Storyboard** (60–90 sec hero video)  
    - Problem animation → Thesis → 5-layer magic → Wesco quote → CTA.

37. **Compliance & Legal Foundation**  
    - SOC 2 Type I readiness checklist, Privacy Policy / DPA template, Data Processing Addendum, Vendor security questionnaire responses, Liability & Indemnification framework for agent actions.

38. **Metrics & Observability Dashboard Definition**  
    - Product (agents governed, orphan reduction %, policy violation blocks), Business (ARR, NRR, CAC, design partner conversion), Security (audit log completeness, mean time to deprovision).

39. **Vendor & Dependency Map**  
    - Core (Neo4j/Neptune, Kong or custom gateway, IdP SDKs, DLP engine – open source vs build), nice-to-have (SIEM, CMDB).

40. **Post-Launch 90-Day Plan** (After first customer)  
    - Feature backlog prioritization, pricing iteration, partnership outreach (Microsoft, Kong, ServiceNow), hiring plan.

---

## Usage Notes for Teams
- **Builders:** Start with docs 8–17 immediately after Phase 0 alignment. Use as input to Jira epics and architecture review board.
- **Marketers:** Own 18–26 + 27–32. Parallel work with builders; feed customer language back into PRD.
- **Internal:** Use Phase 0 docs for kickoff, board updates, and recruiting.
- **Living Documents:** All specs marked "v0.1 – Wesco PoC" will iterate based on design partner feedback.
- **Tools:** Store in shared drive (Notion/Confluence + Git for code specs). Diagrams in Figma + draw.io. Code repos follow standard monorepo or per-layer services.

**Next Step:** We are now producing Phase 0 documents one by one, starting with Name Finalization + Positioning. All files will be written to `/home/workdir/artifacts/`.

**Pedigree wins the category by owning the human-agent lineage graph as the undisputed system of record.** Let's build it.