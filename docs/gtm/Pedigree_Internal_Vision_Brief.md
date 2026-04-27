# Pedigree – Internal Vision & Strategy Brief
**Version:** 0.9 (Wesco Design Partner PoC)  
**Date:** April 19, 2026  
**Audience:** All team members, advisors, design partner stakeholders  
**Length:** Read in 8 minutes

## The Problem (8 Gaps That Keep CISOs Awake)
Enterprise AI agents (Copilot Studio, LangChain, custom, Zapier, n8n, etc.) are exploding. NHIs now outnumber humans 25–100×. Yet the IAM stack was built for people, not autonomous agents.

**The 8 gaps** (validated by Wesco/Anixter Head of IAM, Fortune 500):
1. **No ownership attribution** — Agents created by business users have no tie to the human. When the human leaves, the agent goes rogue with live credentials.
2. **No scope enforcement** — Agents routinely receive entitlements beyond their creator's access.
3. **No Segregation of Duties (SoD) for agents** — Toxic combinations that would be blocked for humans are trivial for agents (including chained actions across sessions).
4. **No app-owner approval** — ServiceNow, Oracle, SAP, Salesforce, Snowflake owners have zero visibility or veto on agents calling their systems.
5. **No lifecycle management** — No provisioning workflow, no recertification, no HR-tied deprovisioning. Agents accumulate forever.
6. **No runtime enforcement** — Discovery tools exist. Inline gateway checking every tool call against policy, parent scope, and SoD is unsolved at scale.
7. **No data exfiltration guardrails** — Agents can scoop PII/PHI/PCI/SOX data far beyond intended scope.
8. **Audit trail gaps** — Even Microsoft Copilot has documented cases bypassing M365 logs when acting on behalf of users.

**Market validation (2026 data)**: 76% of orgs report NHI growth tied to agentic AI. Only ~5% have meaningful production-scale governance. 92% of security leaders doubt legacy IAM can handle this. The window is 12–18 months before a category winner emerges.

## Our Thesis (The One Design Choice That Changes Everything)
**Every enterprise has two org charts.**  
The human one (Workday, UKG, ADP) is authoritative, auditable, and tied to HR events.  
The agent one does not exist — agents live in .env files, scattered credentials, and untraceable service accounts.

**Pedigree treats agents as digital children of the humans who created them.**

- Every agent is a **child node** under a parent human in the live org graph.
- Agents **inherit a strict subset** of the parent's current entitlements (derivative credentials via Token Exchange, never copies).
- Approvals, recertification, and deprovisioning flow through the **parent's management chain**.
- HR termination events trigger **automatic cascade deprovisioning** of the entire agent subtree.
- Runtime policy, SoD, and DLP are evaluated in **org-chart terms** ("this agent belongs to the Finance Manager who cannot approve payments to vendors she created").

This single primitive solves all 8 gaps at once. Governance, lifecycle, audit, and security "fall out" of the graph.

## Why This Wins (The Moat)
The moat is **not** the broker, the credential engine, or the DLP rules — those exist in pieces across 10+ vendors (Veza, Britive, PlainID, Kong MCP Gateway, Microsoft Entra Agent ID + Agent 365, etc.).

**The moat is the authoritative human-to-agent lineage graph wired to HRIS.**

Once a customer connects their HRIS and every agent has a parent-human edge, ripping Pedigree out means rebuilding years of lineage history and re-certifying thousands of agents. The platform becomes the **system of record for agent ownership**, and every other tool (Entra, gateways, IGA platforms) becomes a consumer via API.

This is the Workday play for HR, the Okta play for identity, the Snowflake play for data — applied to the fastest-growing identity category in history.

**2026 Reality Check (Why We Must Move Fast)**:
- Microsoft shipped **Entra Agent ID** + **Agent 365** (preview 2025, now GA) — first-class identities for agents with ownership metadata and Conditional Access.
- Veza launched **AI Agent Security** (Dec 2025) with agents-to-human mapping and blast-radius visualization.
- Britive and PlainID launched **runtime MCP enforcement + ZSP/JIT** with human tie-ins (Sep 2025–Feb 2026).
- MCP (Model Context Protocol) is now the standard for agent-tool interactions; every serious gateway is MCP-aware.

**Pedigree's unique position**: We are the **only one building the deep org-chart inheritance + HR-driven cascade + strict parent-scope cap** on top of these emerging identity layers. We complement Entra Agent ID; we do not compete with it on identity issuance.

## The 5-Layer Architecture (Shipped Incrementally)
1. **Shadow Org Graph** — Ingest HRIS → live human graph → hang agents as child nodes with parent, justification, expiration, scope envelope. HR termination = cascade deprovision.
2. **Credential Clone Engine** — Auto-issue scoped OAuth 2.1 client credentials via Token Exchange against parent's live entitlements. Agent cannot exceed parent's access.
3. **MCP-Aware API Brokerage Gateway** — Sits between every agent and every target system (MCP primary + REST/GraphQL/SOAP/DB). Intercepts every tool call, verifies identity, checks parent scope, evaluates SoD/DLP, passes/blocks/redacts/escalates. Policies expressed in org-chart language.
4. **App Owner Console** — Every target system owner (ServiceNow, Oracle, SAP, Salesforce, GitHub, Snowflake) sees exactly which agents call their system, the parent human, 30-day action history, and one-click revoke. Turns app owners into internal champions.
5. **SoD & DLP Runtime Engines** — Inline SoD watches for toxic action combinations based on parent's org position. DLP classifies/redacts data flowing back to the agent. Rules authored by existing IGA teams in tools they already know (Rego/OPA or native).

**MVP Focus (First 90 Days / Wesco PoC)**: Layers 1 + partial 2 + stub 3 (policy evaluation only) + basic 4 (read-only inventory). Full runtime enforcement in v1.1.

## Go-to-Market Wedge
**Positioning**: "The org chart your AI agents are missing — live in 90 days."  
**Not** "agent security" (pitch fatigue). CEOs want productivity wins; CISOs are the blocker.

**Land**: Free NHI + agent discovery tool. Connects to Entra, ServiceNow, GitHub. Surfaces every agent with parent-human attribution where possible + "Orphan List" of unattributable agents. The orphan list alone sells the paid platform.

**Expand**: Priced per agent under management ($50–$200/agent/month). Enterprise contracts $500k–$2M ARR. Expected 500–5,000 agents per F500 customer within 18 months.

**First Customer**: Wesco International / Anixter (Fortune 500). Head of IAM has articulated the exact spec and wants a solution urgently. Leadership is blocking Copilot Studio until governance exists. This is our design partner PoC — success here = category proof.

## Success Metrics (First 12 Months)
- **Product**: 1 design partner live with full graph + basic runtime; 90%+ orphan attribution accuracy via ML; <5ms added latency on gateway; 100% cascade deprovision success on simulated HR events.
- **Business**: $1.5M+ ARR (3–5 paid customers or expanded Wesco contract); 2+ reference customers; 50+ qualified pipeline.
- **Team**: Ship v1.0; hire 4–6 engineers + 2 GTM; raise seed/Series A on the back of Wesco proof.

## Key Risks & Mitigations (Be Honest)
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Microsoft bundles deep lineage into Entra Agent 365 | Medium | High | Position as "the governance brain on top of Entra"; ship faster on HRIS depth + runtime SoD; partner with Microsoft ecosystem |
| Gateway latency kills agent UX | High | High | Aggressive policy caching + compiled rules + async heavy checks; partner with Kong/Solo MCP gateways instead of building full wire layer |
| Pricing too high vs Veza/Britive bundles | Medium | Medium | Tier aggressively (Discovery free, Core management, Enterprise runtime); prove 5–10× ROI via audit avoidance + productivity |
| HRIS integration unreliable (webhooks, rate limits) | Medium | Medium | Multi-connector + fallback polling + synthetic testing; make "HR event reliability" a first-class SLA |
| Multi-agent / agent-created agents break parent model | High | Medium | Explicit support for "immortal/org-owned" nodes + delegated ownership workflows in v1.1 |

## Why This Team Will Win
- Deep experience in multi-agent systems, policy layers, and enterprise IAM-adjacent consulting.
- Real design partner with urgent, articulated pain and budget.
- Market window is open right now (post-Entra Agent ID launch, pre-consolidation).
- The graph moat compounds: every new customer makes the lineage more valuable and harder to displace.

**This is not another NHI discovery tool. This is the source of truth for the agentic era.**

Pedigree wins by making the human org chart the single source of governance truth for every autonomous agent in the enterprise.

**Questions?** Bring them to the All-Hands kickoff. Let's build the category-defining platform.

---

**Next artifacts to produce (in order):**  
- Core Positioning & Messaging Framework  
- MVP PRD (for builders)  
- High-Level Architecture Document  

All files live in `/home/workdir/artifacts/`. Let's go.