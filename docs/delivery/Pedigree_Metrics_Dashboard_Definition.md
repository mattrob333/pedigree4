# Pedigree Metrics & Observability Dashboard Definition
**Version:** 1.0  
**Date:** April 27, 2026  
**Purpose:** Define the exact Prometheus metrics, Grafana dashboards, and business KPIs that prove MVP success and drive post-MVP product decisions.

---

## 1. Business / Product KPIs (Tracked in Grafana + Custom UI)
**Core North Star:**
- **Agents Under Governance %** = (Agents with live human parent / Total discovered agents) × 100  
  Target (MVP PoC): >95% within 7 days of connection.

**Adoption & Value:**
- Orphan count trend (daily/weekly)
- Cascade success rate (% of HR terminations that fully completed reassign + disable + audit export)
- Avg time to deprovision subtree (target <60s for 50 agents)
- Policy violation blocks (creation + runtime) per week
- App owner adoption: # of revokes performed / # of unique app owners who logged in

**Risk & Compliance:**
- % of agents with risk_score > 70 (by department / human role)
- Audit export requests (SOX / internal audit evidence pulls)
- Failed policy evaluations (creation blocked vs runtime blocked split)

**Usage:**
- Daily / Weekly Active IAM Admins & App Owners
- Dashboard load time p95 (<2s target)
- API request volume (by endpoint) + error rate

---

## 2. Technical / Platform Metrics (Prometheus + OpenTelemetry)
**Ingestion & Sync:**
- `pedigree_ingestion_sync_duration_seconds` (histogram, by source: dataverse/hris/entra)
- `pedigree_agents_discovered_total` (counter, by platform)
- `pedigree_attribution_accuracy` (gauge or derived from orphan %)
- `pedigree_orphans_total` (gauge)

**Graph & Policy:**
- `pedigree_graph_query_duration_seconds` (histogram, by query_type: subtree/cascade/policy_eval)
- `pedigree_policy_evaluations_total` (counter, by decision: allow/block/escalate)
- `pedigree_policy_eval_duration_seconds` (histogram — p99 target <10ms)

**Lifecycle & Runtime:**
- `pedigree_cascade_duration_seconds` (histogram, by #agents affected)
- `pedigree_runtime_gateway_requests_total` (counter, by decision)
- `pedigree_runtime_gateway_latency_seconds` (histogram — p99 target <15ms for stub)

**Infrastructure:**
- Container Apps / AKS CPU/Memory utilization
- Postgres / Neo4j / Redis connection pool usage + query latency
- Error rate by service (5xx, exceptions)
- Audit export size & success rate

---

## 3. Recommended Grafana Dashboards (4 Boards)

**Board 1: Executive Overview (Business Health)**
- Agents Under Governance % (big number + trend)
- Orphan Trend (line chart, last 30 days)
- Cascade Success Rate + Avg Time
- Top 5 Risky Departments / Humans (by agent count + risk_score)
- Policy Violations (creation vs runtime, last 7 days)
- App Owner Adoption (revokes performed this week)

**Board 2: Operational Health (Platform Team)**
- Ingestion Sync Duration & Success Rate (by source)
- Graph Query p99 Latency
- Policy Eval p99 Latency + Throughput
- Runtime Gateway Latency + Error Rate
- Resource Utilization (CPU/Mem per service)
- Audit Export Volume & Failures

**Board 3: Security & Compliance (IAM / CISO View)**
- Risk Score Distribution (histogram)
- Agents by Status (active / inactive / orphaned / pending)
- Cascade Audit Events (last 50 with drill-down)
- Failed Auth / Privilege Escalation Attempts
- Export Requests (who pulled what lineage when)

**Board 4: Per-Tenant Detail (for large customers)**
- All above filtered by `tenant_id`
- Top 10 humans by #agents owned + risk
- Slowest policy evaluations or cascades this week

---

## 4. Alerting Rules (Critical — PagerDuty / Teams)
- Agents Under Governance < 90% for >24h
- Cascade failure rate > 5% in last 6 hours
- Policy eval p99 > 50ms for >10 min
- Orphan count increase > 20% in 24h (sudden spike)
- Audit export failure > 0 in last hour
- Neo4j / Postgres connection errors > 5/min
- High-severity security events (auth bypass, injection attempt)

---

## 5. Data Sources & Collection
- **Prometheus + OpenTelemetry:** Auto-instrumented in all Python services (FastAPI + Neo4j driver + Postgres).
- **Custom Business Metrics:** Exposed via `/metrics` endpoint or pushed from services (e.g., attribution accuracy calculated in ingestion job).
- **Grafana Data Sources:** Prometheus (technical), Postgres (business KPIs via SQL), Loki (logs), Tempo (traces).
- **Retention:** 90 days raw, 1 year aggregated (or customer-configurable).

---

## 6. Success Criteria for MVP
- All dashboards green during PoC.
- <5 false-positive alerts per week.
- Wesco IAM team uses the Executive Overview board in their weekly governance meeting by end of PoC.

---

**This observability setup turns Pedigree from "black box governance tool" into a transparent, measurable platform that customers trust with their most sensitive identity data.**

Next (final in batch): Brand Kit + Logo Concept (with generated image).