export type HumanStatus = 'active' | 'terminated' | 'on_leave';
export type AgentStatus = 'active' | 'inactive' | 'orphaned' | 'pending_deprovision';

export interface Human {
  human_id: string;
  tenant_id: string;
  external_id: string;
  email: string;
  full_name: string;
  department: string | null;
  job_title: string | null;
  status: HumanStatus;
  manager_id: string | null;
  entitlements: string[];
  created_at: string;
}

export interface Agent {
  agent_id: string;
  tenant_id: string;
  external_id: string;
  platform: string;
  name: string;
  description: string | null;
  status: AgentStatus;
  owner_human_id: string | null;
  scope_snapshot: {
    knowledge_sources?: string[];
    actions?: string[];
    environment_id?: string;
  };
  risk_score: number;
  created_at: string;
}

export interface DemoSummary {
  tenant: string;
  humans: number;
  agents: number;
  orphaned_agents: number;
  high_risk_agents: number;
  policies: number;
}

export interface ApiList<T> {
  data: T[];
  total: number;
}

export interface CascadeAction {
  agent_id: string;
  agent_name: string;
  action: string;
  target_owner: string;
  reason: string;
}

export interface CascadeResponse {
  status: string;
  human: Human;
  agents_affected: Agent[];
  recommended_actions: CascadeAction[];
}
