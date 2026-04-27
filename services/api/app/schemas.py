from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class Human(BaseModel):
    human_id: str
    tenant_id: str
    external_id: str
    email: str
    full_name: str
    department: str | None = None
    job_title: str | None = None
    status: Literal["active", "terminated", "on_leave"]
    manager_id: str | None = None
    entitlements: list[str] = Field(default_factory=list)
    created_at: datetime


class Agent(BaseModel):
    agent_id: str
    tenant_id: str
    external_id: str
    platform: Literal["copilot_studio", "m365_agent_builder", "entra_agent_id", "custom"]
    name: str
    description: str | None = None
    status: Literal["active", "inactive", "orphaned", "pending_deprovision"]
    owner_human_id: str | None = None
    scope_snapshot: dict[str, Any] = Field(default_factory=dict)
    risk_score: float = 0
    created_at: datetime


class Policy(BaseModel):
    policy_id: str
    name: str
    type: Literal["scope_cap", "sod", "lifecycle", "dlp"]
    rule: dict[str, Any] = Field(default_factory=dict)
    enabled: bool = True


class AuditEvent(BaseModel):
    event_id: str
    event_type: str
    actor_human_id: str | None = None
    target_agent_id: str | None = None
    target_human_id: str | None = None
    payload: dict[str, Any] = Field(default_factory=dict)
    source: str = "api"
    occurred_at: datetime


class RuntimeEvaluationRequest(BaseModel):
    agent_external_id: str
    action: str
    context: dict[str, Any] = Field(default_factory=dict)


class RuntimeEvaluationResponse(BaseModel):
    decision: Literal["allow", "block", "escalate"]
    reason: str
    policy_id: str | None = None
    human_parent: Human | None = None


class TerminationWebhook(BaseModel):
    employee_id: str
    termination_date: datetime
    reason: str | None = None


class ReassignRequest(BaseModel):
    new_owner_human_id: str
    reason: Literal["hr_termination", "manual", "policy_violation"]
