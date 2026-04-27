# Pedigree Security Architecture & Threat Model (MVP)
**Version:** 1.0  
**Date:** April 27, 2026  
**Compliance Target:** SOC 2 Type I (MVP), ISO 27001 roadmap, customer-specific (SOX, HIPAA, PCI as needed via data mapping).

---

## 1. Security Principles
- **Zero Trust by Default:** Never trust, always verify. Every request (human or service) is authenticated, authorized, and policy-evaluated.
- **Least Privilege:** Entra app permissions are granular and tenant-scoped. No standing broad access.
- **Data Minimization:** Pedigree stores only lineage metadata, scope snapshots, and audit events — never raw agent prompts, knowledge documents, or PII beyond what's required for attribution (email, employee ID, manager).
- **Defense in Depth:** Controls at creation time + runtime stub + Entra Conditional Access + network + logging.
- **Audit Everything:** Immutable, exportable logs for every decision and change — the "Pedigree" of the Pedigree system itself.
- **Customer Data Sovereignty:** All customer data (graph, audit, config) remains in their Azure tenant/region. Pedigree service only processes metadata.

---

## 2. Threat Model (STRIDE per Component)

### 2.1 Ingestion Service (Dataverse + Entra + HRIS connectors)
**Threats:**
- **Spoofing:** Attacker impersonates Dataverse webhook or HRIS.
- **Tampering:** Modify agent metadata or HR termination event to hide ownership.
- **Repudiation:** Deny that a cascade happened or an agent was attributed to a terminated user.
- **Information Disclosure:** Leak Entra tokens or full employee list during sync.
- **Denial of Service:** Flood with fake webhooks or large Dataverse result sets.
- **Elevation of Privilege:** Compromised ingestion worker gains broad Dataverse read/write.

**Mitigations (MVP):**
- All webhooks signed + validated (HMAC or Entra JWT with specific claims).
- Mutual TLS or private endpoints for all Microsoft services.
- Idempotent upserts with conflict detection (last-write-wins with audit of conflicts).
- Structured logging + immutable audit_events for every ingestion decision.
- Rate limiting + circuit breakers + backoff on connectors.
- Managed Identity + least-privilege Entra app (read-only Dataverse + User.Read.All + specific Power Platform scopes). No write except explicit reassign (separate high-privilege app registration with approval gate).
- Token vault (Azure Key Vault) — never log secrets.

### 2.2 Shadow Org Graph (Neo4j + PostgreSQL)
**Threats:**
- **Tampering:** Attacker modifies parent-child edges or scope_snapshot to grant excessive permissions.
- **Information Disclosure:** Query dump of entire org chart + agent entitlements.
- **Elevation:** Compromised app gains write to graph and creates fake humans/agents.
- **Repudiation:** Alter historical cascade events.

**Mitigations:**
- Graph writes only from Ingestion Service + authorized admin APIs (RBAC enforced).
- Row-level security + tenant_id filter at query layer (never rely on app to filter).
- Encryption at rest (Azure Disk encryption + TDE for Postgres).
- Point-in-time recovery + immutable audit trail (every graph mutation logged to audit_events before commit).
- Read replicas for dashboards; write path strictly controlled.
- Regular integrity checks (hash of critical subtrees) + anomaly detection on edge changes.

### 2.3 Policy Engine + Runtime Gateway Stub
**Threats:**
- **Tampering:** Bypass policy checks (e.g., modify scope_snapshot or rule evaluation).
- **Elevation:** Malicious agent action tricks gateway into allowing SoD violation or data exfil.
- **Information Disclosure:** Policy decisions leak sensitive human entitlements or agent actions.
- **Denial of Service:** Flood gateway with evaluation requests to exhaust resources or hide real violations.

**Mitigations:**
- Policy evaluation is deterministic and logged immutably before any allow/forward decision.
- Gateway is stateless (or short-lived state in Redis with TTL); all decisions re-evaluable from audit log.
- Input validation + schema enforcement on action context.
- Circuit breaker + rate limit per agent/human (prevent abuse).
- For demo proxy: Only forward if policy allows; otherwise return structured error with policy_id + explanation (no data leakage).
- Future (v1.1): Cryptographic signing of policy decisions; remote attestation for gateway instances.

### 2.4 Web UI + API Gateway
**Threats:**
- **Spoofing / Session Hijacking:** Steal JWT or session cookie.
- **Cross-Site Scripting / CSRF:** Inject malicious script or action via UI.
- **Broken Access Control:** App Owner sees agents/resources they shouldn't; IAM Admin performs unauthorized reassign.
- **Injection:** Malicious search/filter parameters cause graph query DoS or data leak.

**Mitigations:**
- Entra OIDC + short-lived JWT (15 min) + refresh tokens. HttpOnly + Secure cookies.
- CSRF tokens + SameSite=Strict.
- Strict RBAC at API layer (never trust frontend claims).
- Input sanitization + parameterized queries (Cypher + SQL).
- Content Security Policy, rate limiting, WAF (Azure Application Gateway or Cloudflare).
- Role-based UI rendering (features hidden if no permission).

### 2.5 External Integrations (Power Platform Reassign, Entra, SIEM)
**Threats:**
- **Elevation via Reassign API:** Pedigree abused to reassign agents to attacker-controlled owner.
- **Token Theft:** Entra tokens for Graph/Dataverse exfiltrated.
- **SIEM Poisoning:** Fake audit events hide real violations.

**Mitigations:**
- Reassign calls use dedicated high-privilege Entra app with conditional access (location + MFA + approval workflow for non-HR events).
- All tokens short-lived + acquired via managed identity or secure secret store (never in code/config).
- SIEM export uses mutual auth + signed payloads; customer can verify chain of custody.
- Anomaly detection on reassign volume/frequency (alert on >10 reassigns in 1 hour without HR event).

---

## 3. Data Protection & Privacy
- **Classification:** Lineage metadata = Internal / Confidential (customer-specific). No Secret/PII beyond minimal attribution fields.
- **Encryption:** At rest (AES-256 via Azure), in transit (TLS 1.3 everywhere).
- **Retention:** Audit events = 7 years (or customer policy); graph nodes = active + 90 days tombstone for terminated humans (configurable).
- **Subject Rights:** Support "right to be forgotten" for terminated humans (anonymize or delete graph edges after legal hold period, with immutable audit of deletion).
- **Cross-Border:** All processing in customer's Azure region (no Pedigree control plane data residency).

---

## 4. Key Controls & Implementation (MVP)
**Identity & Access:**
- Entra ID as IdP for all human users.
- Managed Identities for all Azure services.
- Just-in-Time (JIT) / Just-Enough-Access (JEA) via Entra PIM for any standing admin roles.
- Quarterly access reviews (automated via Graph + Pedigree RBAC).

**Network:**
- All resources in private VNet with private endpoints.
- No public IPs except UI (fronted by WAF + Entra CA policies: compliant device, location, risk score).
- DDoS protection + WAF rules tuned for API abuse.

**Logging & Monitoring:**
- OpenTelemetry traces + metrics for every request/decision.
- Centralized logging (Azure Monitor / Log Analytics) with 90-day retention + export to customer SIEM.
- Anomaly alerts: sudden spike in orphans, reassign volume, policy violations, failed auth.
- Regular (automated) integrity scans of graph (detect tampered edges).

**Vulnerability Management:**
- Dependabot + Snyk for all dependencies.
- Monthly container scanning + OS patching.
- Internal + external pen-test before PoC go-live (focus: auth bypass, injection, privilege escalation, data exfil via runtime stub).

**Incident Response:**
- Playbooks for "compromised tenant", "mass orphan creation", "policy bypass detected".
- Automated containment (disable affected agents, revoke tokens, alert customer).
- Forensic export of affected lineage subtree + decisions.

---

## 5. Compliance Mapping (MVP)
- **SOC 2 CC1 (Security):** All above controls.
- **CC2 (Availability):** Multi-AZ deployment, circuit breakers, graceful degradation (policy engine fails open with logging for non-critical paths).
- **CC3 (Confidentiality):** Encryption + least privilege + DLP on export.
- **CC4 (Processing Integrity):** Deterministic policy engine + immutable audit + reconciliation jobs.
- **CC5 (Privacy):** Data minimization + subject rights support + retention policies.
- **Customer-specific:** Provide evidence packages (lineage export, access logs, pen-test report) for their SOX/audit.

---

## 6. Residual Risks (Accepted for MVP) & Post-MVP Roadmap
**Accepted (with monitoring):**
- Runtime stub is not full inline gateway (latency/compatibility risk) — mitigated by demo scope + clear "stub" labeling.
- Entra Agent ID still preview — core Dataverse path is stable.
- No advanced DLP/redaction on LLM outputs yet.

**Post-MVP (v1.1+):**
- Full production MCP gateway with sub-5ms p99 + WAF + remote attestation.
- Cryptographic policy decision signing + verifiable audit trail.
- Customer-managed keys (CMK) for graph encryption.
- FedRAMP Moderate / High baseline (if required by public sector customers).
- Continuous authorization (real-time Entra risk + Pedigree policy fusion).

---

**This threat model is comprehensive for MVP and directly informs the implementation of every component.** No feature ships without passing the relevant controls.

Next: Full Test Plan (unit + integration + E2E + security/chaos tests for cascade), Infrastructure as Code (Terraform + Bicep + Azure Landing Zone alignment), CI/CD pipeline, and sample code for key services (Ingestion, Policy Engine, Gateway Stub). 

All files will be in the repo structure ready for the coding agent.