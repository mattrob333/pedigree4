# Pedigree Test Plan (MVP)
**Version:** 1.0  
**Date:** April 27, 2026  
**Scope:** All user stories and acceptance criteria from the MVP PRD.  
**Testing Pyramid:** 70% unit, 20% integration, 10% E2E + security/chaos.

---

## 1. Test Levels & Tools
- **Unit:** pytest (Python services) + Jest/Vitest (React components). Target >85% coverage on critical paths (ingestion, policy, graph writes, cascade logic).
- **Integration:** pytest + testcontainers (Postgres, Neo4j, Redis) + httpx for API tests. Real Dataverse sandbox + Entra test tenant.
- **E2E:** Playwright (UI flows) + Locust (load) + custom chaos scripts (termination flood, Dataverse outage).
- **Security:** OWASP ZAP + custom scripts for auth bypass, injection, privilege escalation. Internal red-team + external pen-test firm (if budget).
- **Performance:** k6 or Locust for p99 latency on policy eval (<10ms), cascade (<60s for 100 agents), ingestion sync (<5 min for 5k agents).
- **Chaos / Resilience:** Toxiproxy for network latency, Gremlin or custom scripts for HRIS outage, Dataverse rate-limit simulation, Neo4j failover.

---

## 2. Critical Test Suites (Trace to PRD ACs)

### Suite A: Discovery & Attribution (Epic 1)
**Test Cases:**
- TC-A1: Dataverse webhook + poll reconciliation → 100% of 500 test bots attributed or orphaned correctly within 5 min.
- TC-A2: Fuzzy matching (name + department) for 10% of agents with missing Entra link → 90%+ accuracy.
- TC-A3: Orphan list generation + "Suggest Parent" ML stub returns top 3 candidates with confidence scores.
- TC-A4: Concurrent ingestion (10 workers) with duplicate events → no duplicate nodes, correct audit trail.

**Tools:** pytest + testcontainers (Neo4j + Postgres) + real Dataverse sandbox.

### Suite B: HR Lifecycle & Cascade (Epic 2)
**Test Cases:**
- TC-B1: HR termination webhook → full subtree (50 agents) reassigned via real Power Platform API + bot state set to Inactive + audit bundle exported.
- TC-B2: Reorg simulation (manager change) → all descendant agents re-evaluated for new inherited scope (no auto-provision yet).
- TC-B3: Cascade under load (100 simultaneous terminations) → all complete <120s, no lost events, SIEM receives 100% of events.
- TC-B4: Idempotency — duplicate termination event → single cascade, duplicate audit entries flagged.

**Chaos:** Inject 30% packet loss on HRIS webhook + Dataverse reassign API → retry with backoff succeeds.

### Suite C: Scope & Policy (Epic 3)
**Test Cases:**
- TC-C1: Agent created with scope > parent's current entitlements → flagged + creation blocked (strict mode) or warning created.
- TC-C2: Simple SoD rule ("Finance cannot own agent calling both CreateVendor + ApprovePayment") → violation detected at creation + runtime evaluate.
- TC-C3: Policy evaluation p99 <10ms on 10k cached evaluations.
- TC-C4: Snapshot refresh (daily) detects entitlement change in parent → risk score updated + notification.

### Suite D: App Owner Console (Epic 4)
**Test Cases:**
- TC-D1: SharePoint site owner logs in → sees exactly the agents that reference their site via knowledge source + human Pedigree lineage.
- TC-D2: One-click revoke → calls reassign API + agent disabled + human owner notified via Teams/Graph.
- TC-D3: Cross-resource visibility (Dataverse table + SharePoint) with correct access_type.

### Suite E: Runtime Stub (Epic 5)
**Test Cases:**
- TC-E1: Sample Copilot action ("CreateVendorRecord") through proxy → policy allow + forwarded + decision logged with full human context.
- TC-E2: SoD violation action → blocked with 403 + structured error containing policy_id + explanation + human parent.
- TC-E3: Gateway under load (1000 req/s) → p99 <15ms, no dropped decisions, circuit breaker activates on downstream failure.

### Suite F: Security & Compliance
**Test Cases:**
- Auth bypass attempts (JWT tampering, role escalation, cross-tenant).
- Injection (Cypher, SQL, GraphQL if added) on all input points.
- Data exfil via audit export or policy explain.
- Cascade audit bundle integrity (hash chain verification).
- Pen-test critical findings closed before PoC.

---

## 3. Test Data Strategy
- **Synthetic:** 5k humans + 2k agents (generated via factories with realistic Entra + Dataverse shapes).
- **Anonymized Customer:** Workday export (sanitized) + real Copilot Studio bots from design partner sandbox (with consent).
- **Edge Cases:** Orphaned agents, matrix org (dotted-line managers), large subtrees (500+ agents under one VP), concurrent reassigns.

---

## 4. CI/CD Integration
- Every PR: unit + integration tests (fast subset).
- Main branch: full suite + security scan + load test (nightly).
- Pre-PoC: full E2E + chaos suite + pen-test report sign-off.
- Gates: >80% coverage on critical paths, zero critical security findings, all ACs passing.

---

## 5. Non-Functional Test Targets (MVP)
- Ingestion sync: 5k agents in <5 min.
- Policy eval: p99 <10ms.
- Cascade (100 agents): <60s end-to-end.
- UI dashboard load: <2s on 10k agents.
- Availability: 99.5% during PoC window (planned maintenance windows documented).

---

**This test plan ensures every PRD acceptance criterion is validated before the design partner sees the demo.** Chaos and security tests are non-negotiable for a governance product.

Next files in this batch: Infrastructure as Code, Sample Code Skeletons, Wesco PoC Playbook.