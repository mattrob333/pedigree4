from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid5, NAMESPACE_URL

from .schemas import Agent, AuditEvent, Human, Policy


class DemoStore:
    def __init__(self, data_path: Path, tenant_id: str = "contoso-demo") -> None:
        self.data_path = data_path
        self.tenant_id = tenant_id
        self.humans = self._load_humans()
        self.agents = self._load_agents()
        self.policies = self._load_policies()
        self.audit_events: list[AuditEvent] = []

    def _load_json(self, name: str) -> list[dict]:
        path = self.data_path / name
        if not path.exists():
            return []
        return json.loads(path.read_text(encoding="utf-8"))

    def _stable_id(self, kind: str, external_id: str) -> str:
        return str(uuid5(NAMESPACE_URL, f"pedigree:{self.tenant_id}:{kind}:{external_id}"))

    def _load_humans(self) -> list[Human]:
        now = datetime.now(UTC)
        humans: list[Human] = []
        for row in self._load_json("hris_employees.json"):
            status = row.get("status", "active")
            humans.append(
                Human(
                    human_id=self._stable_id("human", row["employee_id"]),
                    tenant_id=self.tenant_id,
                    external_id=row["employee_id"],
                    email=row["email"],
                    full_name=row["full_name"],
                    department=row.get("department"),
                    job_title=row.get("job_title"),
                    status=status if status in {"active", "terminated", "on_leave"} else "active",
                    manager_id=row.get("manager_id"),
                    entitlements=row.get("entitlements", []),
                    created_at=now,
                )
            )
        return humans

    def _resolve_owner(self, bot: dict) -> Human | None:
        owner = bot.get("ownerid", {})
        aad_id = owner.get("azureactivedirectoryobjectid")
        email = owner.get("internalemailaddress")
        for human in self.humans:
            entra_slug = f"{human.email.split('@')[0].replace('.', '-')}-entra-id"
            if human.external_id == aad_id or entra_slug == aad_id or human.email == email:
                return human
        for human in self.humans:
            if human.email == email:
                return human
        return None

    def _risk_score(self, bot: dict, owner: Human | None) -> float:
        score = 15.0
        actions = [str(action).lower() for action in bot.get("actions", [])]
        knowledge = [str(source).lower() for source in bot.get("knowledge_sources", [])]
        if owner is None or owner.status != "active":
            score += 45
        if any("approve" in action or "payment" in action for action in actions):
            score += 25
        if any("write" in action or "grant" in action or "create" in action for action in actions):
            score += 15
        if any("payment" in source or "vendor" in source for source in knowledge):
            score += 10
        return min(score, 100.0)

    def _load_agents(self) -> list[Agent]:
        agents: list[Agent] = []
        for bot in self._load_json("dataverse_bots.json"):
            owner = self._resolve_owner(bot)
            state = bot.get("statecode", 0)
            status = "active" if state == 0 else "inactive"
            if owner is None or owner.status != "active":
                status = "orphaned"
            created_at = datetime.fromisoformat(bot["createdon"].replace("Z", "+00:00"))
            agents.append(
                Agent(
                    agent_id=self._stable_id("agent", bot["botid"]),
                    tenant_id=self.tenant_id,
                    external_id=bot["botid"],
                    platform="copilot_studio",
                    name=bot["name"],
                    description=bot.get("description"),
                    status=status,
                    owner_human_id=owner.human_id if owner else None,
                    scope_snapshot={
                        "knowledge_sources": bot.get("knowledge_sources", []),
                        "actions": bot.get("actions", []),
                        "environment_id": bot.get("environment_id"),
                    },
                    risk_score=self._risk_score(bot, owner),
                    created_at=created_at,
                )
            )
        return agents

    def _load_policies(self) -> list[Policy]:
        return [
            Policy(
                policy_id=self._stable_id("policy", "agent-must-have-human-parent"),
                name="Agent must have a live human parent",
                type="lifecycle",
                rule={"status": "owner_human.status == active"},
            ),
            Policy(
                policy_id=self._stable_id("policy", "finance-sod-create-approve-payment"),
                name="Finance SoD: create vendor and approve payment",
                type="sod",
                rule={"toxic_actions": ["CreateVendorRecord", "ApprovePayment"]},
            ),
            Policy(
                policy_id=self._stable_id("policy", "parent-scope-cap"),
                name="Agent cannot exceed parent scope",
                type="scope_cap",
                rule={"mode": "demo_keyword_check"},
            ),
        ]

    def list_humans(self, status: str | None = None, search: str | None = None) -> list[Human]:
        humans = self.humans
        if status:
            humans = [human for human in humans if human.status == status]
        if search:
            q = search.lower()
            humans = [human for human in humans if q in human.full_name.lower() or q in human.email.lower()]
        return humans

    def get_human(self, human_id: str) -> Human | None:
        return next((human for human in self.humans if human.human_id == human_id or human.external_id == human_id), None)

    def list_agents(self, status: str | None = None, owner_human_id: str | None = None) -> list[Agent]:
        agents = self.agents
        if status:
            agents = [agent for agent in agents if agent.status == status]
        if owner_human_id:
            agents = [agent for agent in agents if agent.owner_human_id == owner_human_id]
        return agents

    def get_agent(self, agent_id: str) -> Agent | None:
        return next((agent for agent in self.agents if agent.agent_id == agent_id or agent.external_id == agent_id), None)

    def add_audit_event(self, event_type: str, payload: dict, target_agent_id: str | None = None, target_human_id: str | None = None, source: str = "api") -> AuditEvent:
        event = AuditEvent(
            event_id=str(uuid5(NAMESPACE_URL, f"audit:{self.tenant_id}:{event_type}:{datetime.now(UTC).isoformat()}")),
            event_type=event_type,
            target_agent_id=target_agent_id,
            target_human_id=target_human_id,
            payload=payload,
            source=source,
            occurred_at=datetime.now(UTC),
        )
        self.audit_events.append(event)
        return event

    def plan_termination_cascade(self, employee_id: str) -> dict:
        human = self.get_human(employee_id)
        if not human:
            return {"human": None, "agents_affected": [], "recommended_actions": []}
        affected = [agent for agent in self.agents if agent.owner_human_id == human.human_id]
        actions = []
        manager = self.get_human(human.manager_id) if human.manager_id else None
        for agent in affected:
            if agent.risk_score >= 70 or agent.status == "orphaned":
                action = "suspend"
            else:
                action = "transfer_sponsor"
            actions.append(
                {
                    "agent_id": agent.agent_id,
                    "agent_name": agent.name,
                    "action": action,
                    "target_owner": manager.full_name if manager else "Compliance Archive",
                    "reason": "High risk or missing lineage" if action == "suspend" else "Business purpose may remain valid",
                }
            )
        self.add_audit_event(
            "hr_termination_cascade_planned",
            {"employee_id": employee_id, "actions": actions},
            target_human_id=human.human_id,
            source="hris_webhook",
        )
        return {"human": human, "agents_affected": affected, "recommended_actions": actions}
