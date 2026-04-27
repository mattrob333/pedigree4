from .demo_store import DemoStore
from .schemas import Agent, RuntimeEvaluationResponse


def evaluate_runtime_policy(store: DemoStore, agent: Agent, action: str) -> RuntimeEvaluationResponse:
    parent = store.get_human(agent.owner_human_id) if agent.owner_human_id else None
    lifecycle_policy = next(policy for policy in store.policies if policy.type == "lifecycle")
    sod_policy = next(policy for policy in store.policies if policy.type == "sod")
    scope_policy = next(policy for policy in store.policies if policy.type == "scope_cap")

    if parent is None or parent.status != "active":
        return RuntimeEvaluationResponse(
            decision="block",
            reason="Agent has no active HRIS-verified human parent.",
            policy_id=lifecycle_policy.policy_id,
            human_parent=parent,
        )

    requested = action.lower()
    agent_actions = [str(item).lower() for item in agent.scope_snapshot.get("actions", [])]
    toxic_actions = [str(item).lower() for item in sod_policy.rule.get("toxic_actions", [])]
    if requested in toxic_actions and any(item in toxic_actions for item in agent_actions):
        return RuntimeEvaluationResponse(
            decision="block",
            reason="Requested action creates a Finance segregation-of-duties violation for this lineage.",
            policy_id=sod_policy.policy_id,
            human_parent=parent,
        )

    parent_entitlements = " ".join(parent.entitlements).lower()
    high_risk_terms = ["approve", "payment", "grant", "export", "write"]
    if any(term in requested for term in high_risk_terms) and "*" not in parent_entitlements:
        if not any(term in parent_entitlements for term in high_risk_terms):
            return RuntimeEvaluationResponse(
                decision="escalate",
                reason="Action may exceed the parent human entitlement boundary and needs app-owner approval.",
                policy_id=scope_policy.policy_id,
                human_parent=parent,
            )

    return RuntimeEvaluationResponse(
        decision="allow",
        reason="Agent has an active human parent and no demo policy violations matched.",
        policy_id=None,
        human_parent=parent,
    )
