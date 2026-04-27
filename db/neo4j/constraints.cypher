CREATE CONSTRAINT human_external_id IF NOT EXISTS
FOR (h:Human) REQUIRE (h.tenant_id, h.external_id) IS UNIQUE;

CREATE CONSTRAINT human_email IF NOT EXISTS
FOR (h:Human) REQUIRE (h.tenant_id, h.email) IS UNIQUE;

CREATE CONSTRAINT agent_external_id IF NOT EXISTS
FOR (a:Agent) REQUIRE (a.tenant_id, a.external_id) IS UNIQUE;

CREATE INDEX human_status IF NOT EXISTS
FOR (h:Human) ON (h.status);

CREATE INDEX agent_status IF NOT EXISTS
FOR (a:Agent) ON (a.status);

CREATE INDEX agent_risk IF NOT EXISTS
FOR (a:Agent) ON (a.risk_score);
