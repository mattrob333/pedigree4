# Pedigree – Core Positioning & Messaging Framework
**Version:** 0.8 (Pre-Wesco Feedback)  
**Date:** April 19, 2026  
**Owner:** Marketing + Product  
**Purpose:** Single source of truth for all external communications, sales enablement, website, decks, and content.

## 1. Category & Positioning Statement

**Category We Own:** Human-Lineage Agent Governance (or "Org-Chart-Native Agent Identity Governance")

**Positioning Statement (for all audiences):**
"Pedigree is the only platform that treats AI agents as organizational extensions of the humans who created them — wiring every agent to the live HRIS org chart so enterprises can finally govern, scope, and deprovision agents the same way they govern humans."

**Shorter Elevator Pitch (30 seconds):**
"Most companies have two org charts: the human one in Workday and a hidden agent one scattered across tools with no ownership. Pedigree makes every agent a child node under its human creator in the real org chart — so when the human leaves, the agent is automatically cleaned up, can't exceed the parent's access, and every action is traceable and compliant. It's the missing governance layer that unblocks safe agentic AI at enterprise scale."

## 2. Value Propositions by Persona (Use These Verbatim in Decks/Website)

**CISO / Head of IAM (Economic Buyer – Technical)**
- "Finally, every agent has a human owner with real accountability — no more rogue agents after someone leaves."
- "Stop blocking Copilot Studio and LangChain deployments. Pedigree gives you the runtime controls and HR-tied lifecycle your existing IAM stack was never designed for."
- "One graph becomes the system of record for agent ownership. Every other tool (Entra, gateways, IGA) consumes it via API."

**App Owner / ServiceNow-Oracle-SAP-Salesforce Owner (Internal Champion)**
- "I finally see every agent calling my system, who owns it, and what it's doing — with one-click revoke."
- "No more mystery agents in my audit reports. Pedigree turns me into the approver instead of the victim."

**Business User / Agent Creator (End User)**
- "I create agents the way I always have — Pedigree automatically attaches them to me with the right scope and gets the approvals I need."
- "My agents live and die with my employment. No more worrying about what happens when I change roles or leave."

**CEO / CIO (Economic Buyer – Business)**
- "Unblock the AI productivity gains your teams are demanding — without creating a compliance or security nightmare."
- "Turn your exploding agent population from a liability into a governed, auditable workforce extension."

## 3. Key Messages & Proof Points (Ranked by Strength)

**Primary Message (Always Lead With This):**
"Every agent needs a Pedigree — a documented human parent, strict scope inheritance, and automatic lifecycle tied to HR events."

**Supporting Messages:**
1. **The Graph is the Moat** — "The authoritative human-to-agent lineage graph becomes your system of record. Once built, it's nearly impossible to rip out."
2. **Runtime That Actually Works** — "Inline MCP-aware enforcement that checks every tool call against parent scope, SoD rules, and DLP — not just discovery after the fact."
3. **HR Events = Security Events** — "Termination, reorg, or promotion in Workday automatically updates or deprovisions the entire agent subtree. No manual cleanup."
4. **App Owners Become Champions** — "The console that makes every system owner love governance instead of fearing it."
5. **Complements, Doesn't Compete with Entra** — "Works on top of Microsoft Entra Agent ID + Agent 365. We add the org-chart brain and HR lifecycle they haven't built yet."

**Proof Points (Use Real or Plausible Data):**
- Wesco/Anixter (Fortune 500 design partner) articulated the exact 8 gaps and is blocking Copilot until solved.
- 76% of organizations report NHI growth directly tied to agentic AI (2026 data).
- Only ~5% of enterprises have meaningful production-scale agent governance today.
- Agents created via Pedigree inherit strict subset of parent's live entitlements via OAuth 2.1 Token Exchange (RFC 8693).
- Cascade deprovision on HR termination — 100% of agent subtree removed in <60 seconds (target).

## 4. Brand Voice & Tone Guidelines

**Voice:** Confident. Precise. Slightly irreverent. Enterprise without being boring.
- We speak like the smartest person in the room who still has a sense of humor.
- We use "we" when talking about the industry problem ("We've all seen the orphan agent list...").
- We are direct about competitors ("Entra Agent ID is great for identity. It still needs Pedigree for governance.").

**Do Say:**
- "The org chart your AI agents are missing"
- "Human accountability for every autonomous action"
- "Stop the agent sprawl before your next audit"
- "Governed agents, not rogue ones"

**Don't Say:**
- "Shadow" anything (negative)
- "AI security platform" (too generic, pitch fatigue)
- "NHI governance" (too acronym-heavy for executives)
- Over-claim on "zero trust" or "complete solution" without proof

**Taglines (Test in Market):**
- Primary: "Every Agent Has a Pedigree."
- Secondary: "The Org Chart for Your AI Workforce."
- Hero: "Govern Agents Like the Humans Who Created Them."

## 5. Competitive Differentiation (Use in Battlecards & Objection Handling)

**Vs Microsoft Entra Agent ID + Agent 365:**
- They give agents first-class identities and basic ownership metadata.
- We give **deep org-chart lineage, HR-driven cascade deprovision, strict parent-scope enforcement, and runtime SoD/DLP expressed in org terms**.
- "Entra tells you *who* the agent is. Pedigree tells you *why* it exists, *what* it can do forever, and *what happens* when the human leaves."

**Vs Veza AI Agent Security:**
- They have excellent discovery, Access Graph, and human mapping.
- We have **strict inheritance + automatic HR lifecycle + app-owner console as a first-class workflow** + deeper SoD based on parent's org position.

**Vs Britive / PlainID (Runtime Players):**
- They excel at JIT/ZSP and MCP runtime enforcement.
- We provide the **policy source of truth** (the graph) that feeds those gateways, plus the long-term ownership and deprovision story they lack.

**When We Win:**
- Customer has strong HRIS (Workday/UKG) and cares about audit/compliance (SOX, HIPAA, PCI).
- They have already tried discovery tools and still have rogue/orphan agents.
- App owners are complaining about lack of visibility.
- They are Microsoft-heavy but need governance beyond what Entra currently offers.

## 6. Objection Handling Scripts (Sales & Website FAQ)

**"Isn't this just what Entra Agent ID does?"**
"No. Entra gives every agent an identity and some metadata. Pedigree wires that identity to the *live human org chart* with parent-child relationships, scope caps, management-chain approvals, and automatic deprovision on HR events. It's the governance layer on top."

**"We already have a discovery tool / Veza / etc."**
"Discovery tells you what exists. Pedigree tells you who owns it forever, enforces what it *should* be able to do, and cleans it up when the human leaves. Most of our early customers had discovery tools and still couldn't pass their next audit."

**"What about agents that need to outlive their creator (compliance bots, etc.)?"**
"We support 'immortal' or 'org-owned' nodes with explicit exception workflows and different approval chains. The default is human-parented; we make the exceptions visible and auditable."

**"Latency on every tool call will kill agent performance."**
"Our gateway uses aggressive policy compilation and caching. Target <5ms p99 added latency. For heavy checks we go async with clear escalation. We also partner with leading MCP gateways (Kong, Solo) so you can use best-of-breed wire while Pedigree supplies the policy brain."

**"Pricing seems high."**
"For 1,000 agents at $100/agent/month that's $1.2M ARR — less than one breach or one failed audit. Most customers see 5–10× ROI in the first year from unblocked productivity + reduced audit findings + FTE savings on manual cleanup."

## 7. Website & Deck Structure (Map Messages to Pages/Slides)

**Landing Page Hero:**
"Every Agent Has a Pedigree.  
The only platform that makes AI agents first-class citizens of your real org chart — with human ownership, strict scope, and automatic lifecycle."

**Product Page Sections:**
- The Problem (8 gaps with icons)
- The Thesis (org chart visual)
- How It Works (5-layer animated diagram)
- Why Pedigree Wins (moat + 2026 timing)
- Customer Story (Wesco quote + metrics)
- Pricing teaser + CTA

**Sales Deck Flow (12–15 slides):**
1. Title + "The org chart your AI agents are missing"
2. The 8 Gaps (validated by Wesco)
3. Market Explosion (NHI stats + agentic growth)
4. Our Thesis (two org charts visual)
5. The 5 Layers (simple diagram)
6. Why Now (Entra + MCP timing)
7. Design Partner Proof (Wesco)
8. Competitive Landscape (2x2: Discovery vs Runtime vs Lineage)
9. Business Model & Traction
10. Roadmap & Vision
11. Team
12. Ask / Next Steps

## 8. Content & Thought Leadership Angles (First 90 Days)

**Blog / LinkedIn / Webinar Topics:**
- "The Agent Org Chart: Why Lineage is the Missing Primitive in 2026"
- "Why Your Entra Agent IDs Still Need a Human Parent"
- "MCP Gateways Are Great — But Who Owns the Policy?"
- "How We Deprovision 47 Agents in 47 Seconds When an Employee Leaves"
- "From Orphan List to Governed Fleet: A Wesco Story"

**Byline Opportunities:** Submit to Dark Reading, CSO Online, Gartner/IAM Summit talks, Microsoft Ignite partner sessions.

---

**This framework is the single source of truth.** Every piece of content, deck, email, or conversation must map back to these messages. Update based on Wesco feedback and first 10 customer conversations.

**Next up in the sequence:** MVP Product Requirements Document (PRD) for the Builders team. Let me know if you want that now, the Architecture spec, the Sales Deck outline, or any other asset from the inventory. 

We're building this methodically — one artifact at a time, all in `/home/workdir/artifacts/`. Pedigree is taking shape.