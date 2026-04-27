CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS tenants (
  tenant_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  entra_tenant_id text,
  hris_type text,
  hris_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS environments (
  environment_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(tenant_id),
  external_id text NOT NULL,
  name text NOT NULL,
  dataverse_url text,
  last_sync_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  UNIQUE (tenant_id, external_id)
);

CREATE TABLE IF NOT EXISTS policies (
  policy_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(tenant_id),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('scope_cap', 'sod', 'dlp', 'lifecycle')),
  rule jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled boolean NOT NULL DEFAULT true,
  created_by_human_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_events (
  event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(tenant_id),
  event_type text NOT NULL,
  actor_human_id text,
  target_agent_id text,
  target_human_id text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text NOT NULL DEFAULT 'api',
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agent_resource_mappings (
  mapping_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(tenant_id),
  agent_id text NOT NULL,
  resource_id text NOT NULL,
  access_type text NOT NULL,
  discovered_at timestamptz NOT NULL DEFAULT now(),
  last_confirmed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_tenant_time ON audit_events (tenant_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_policies_tenant_type ON policies (tenant_id, type, enabled);
CREATE INDEX IF NOT EXISTS idx_agent_resource_agent ON agent_resource_mappings (agent_id);
