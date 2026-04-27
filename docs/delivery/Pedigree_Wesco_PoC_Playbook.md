# Pedigree Wesco / Anixter Design Partner PoC Playbook
**Version:** 1.0  
**Date:** April 27, 2026  
**Objective:** 90-day PoC that proves "Unblock safe Copilot Studio adoption with full human pedigree governance" and secures a paid contract + reference quote.

---

## 1. PoC Success Criteria (Must Pass All)
1. **Discovery & Attribution:** 100% of existing Copilot Studio agents in Wesco's test Power Platform environment(s) are automatically attributed to a live HRIS human (or flagged as orphan) within 24 hours of connection.
2. **Lifecycle:** Simulate termination of 3 test humans (with 5–15 agents each) → all agents successfully reassigned via real Power Platform reassign API + set to Inactive + full lineage snapshot exported to their SIEM within 60 seconds.
3. **Scope Enforcement:** Agent created by a Finance human cannot be granted write access to a Payments-related resource (flagged + blocked at creation time with clear explanation).
4. **App Owner Console:** SharePoint/Dataverse owner sees exactly which agents (with human Pedigree) access their resources and can one-click revoke one successfully.
5. **Runtime Stub:** Sample "CreateVendor + ApprovePayment" action through Pedigree proxy is blocked on SoD violation with full human context in the response and audit log.
6. **Security & Audit:** Zero critical findings in internal security review. Full audit bundle (lineage + decisions) exportable and verifiable for SOX evidence.
7. **Usability:** Wesco IAM team can independently run simulations, view orphans, and generate risk reports without Pedigree support after 2-hour training.
8. **Business Outcome:** Head of IAM confirms "this unblocks Copilot Studio rollout" and provides written reference quote + willingness to be a public case study.

---

## 2. PoC Environment Setup (Week 1–2)
**Wesco Provides (via secure channel):**
- Power Platform environment ID(s) with 200–500 sample/real agents (anonymized where possible).
- Entra tenant admin consent for read-only Dataverse + User.Read.All + specific Power Platform scopes.
- Workday sandbox access or sanitized employee export (email, employee_id, manager, department, job_title, termination_date).
- 3–5 test "app owners" (SharePoint/Dataverse resource owners) for console demo.
- SIEM endpoint for audit export testing (or Splunk/Sentinel trial).

**Pedigree Provides:**
- Dedicated tenant in Pedigree dev/staging.
- Entra app registration template (least-privilege) + setup guide.
- Dataverse connector configured for their env(s).
- HRIS mapping (Workday fields → Pedigree Human schema).
- Sample policies (scope cap + simple SoD for Finance).
- UI access for 10 Wesco users (IAM team + app owners + exec sponsor).

---

## 3. 4-Week PoC Execution Timeline (Sprints 5–6 overlap)

**Week 1: Connect & Discover**
- Day 1–2: Connect Pedigree to Wesco Power Platform + Entra + Workday export.
- Day 3: Run first full sync → present "Orphan List" + attribution accuracy report.
- Day 4–5: IAM team training (2 hours) + self-service simulation of one termination.

**Week 2: Lifecycle & Scope**
- Day 6–8: Execute 3 simulated terminations (different org levels) → show cascade, reassign API calls, audit export.
- Day 9–10: Create 5 new test agents in Copilot Studio with varying scopes → show policy enforcement at creation.
- Day 11: App owner console demo with real Wesco SharePoint/Dataverse resources.

**Week 3: Runtime + Hardening**
- Day 12–14: Wire 2–3 real Copilot actions through Pedigree runtime proxy → demo allow/block on SoD.
- Day 15: Security review + load test (simulate 1k agents + 50 terminations).
- Day 16–17: Fix any issues + final training (advanced reports, policy authoring).

**Week 4: Demo, Feedback, Close**
- Day 18: Full executive + IAM + app owner demo (20–30 min script below).
- Day 19: Collect feedback + reference quote.
- Day 20: Sign PoC success document + discuss production contract (pricing, timeline, support).

---

## 4. Demo Script (20–25 minutes — Executive + Technical)
**Slide 1 (2 min):** "The Problem" — Show current orphan list + rogue agent risk from their own environment (anonymized).

**Slide 2 (3 min):** "The Thesis" — Live org chart with agents as child nodes. "Every agent now has a human parent, scope cap, and automatic cleanup."

**Slide 3 (5 min):** "Lifecycle Magic" — Live demo: Terminate "Jane Doe (Finance Manager)" in simulation → watch 12 agents cascade to Compliance Archive owner via real reassign API + audit log to their SIEM.

**Slide 4 (4 min):** "Scope & SoD Enforcement" — Create new agent in Copilot Studio with excessive scope → blocked at creation. Show runtime block on toxic action combination.

**Slide 5 (3 min):** "App Owner Empowerment" — Log in as real Wesco SharePoint owner → see agents + human Pedigrees → one-click revoke.

**Slide 6 (3 min):** "Audit & Compliance Ready" — Export full lineage snapshot for a terminated human → show SOX-ready evidence bundle.

**Slide 7 (2 min):** "Next Steps" — Production rollout plan, pricing, support model. Ask for reference quote.

**Q&A Buffer:** 5–10 min.

---

## 5. Success Metrics Dashboard (Tracked Daily)
- Attribution accuracy %
- Orphan count trend
- Cascade success rate & time
- Policy violation blocks (creation + runtime)
- App owner adoption (revokes performed)
- UI engagement (daily active IAM users)
- Security incidents (0 target)

---

## 6. Risk Register & Mitigations (PoC-Specific)
- **Risk:** Wesco delays Entra/Dataverse consent → **Mitigation:** Pre-built sandbox with synthetic data + parallel real-env connection.
- **Risk:** Reassign API rate limits during cascade → **Mitigation:** Batch + backoff + queue; show partial success + manual retry UI.
- **Risk:** App owners reluctant to test revoke → **Mitigation:** Use read-only mode first + "what-if" revoke preview.
- **Risk:** Scope policy too strict for real use → **Mitigation:** Start in "monitor only" mode, tune rules with Wesco IGA team.

---

## 7. Post-PoC Handoff Package
- Full environment snapshot + runbook.
- Custom policy library tuned for Wesco (Finance, SOX, IT SoD).
- 30-day production onboarding plan.
- Reference quote template + case study draft.
- Pricing proposal (per-agent + enterprise tiers).

**This playbook turns the design partner into a reference customer in 90 days.** Every task maps back to the PRD ACs and Microsoft integration spec.

Next files: How Pedigree Works Explainer, Metrics Dashboard, Brand Kit + logo image.