from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .demo_store import DemoStore
from .policy import evaluate_runtime_policy
from .schemas import ReassignRequest, RuntimeEvaluationRequest, TerminationWebhook
from .settings import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    app.state.store = DemoStore(settings.seed_data_path, settings.tenant_slug)
    yield


app = FastAPI(
    title="Pedigree API",
    version="0.1.0",
    description="MVP demo API for human-lineage agent governance.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def store() -> DemoStore:
    return app.state.store


@app.get("/health")
def health():
    settings = get_settings()
    return {"status": "ok", "demo_mode": settings.demo_mode, "tenant": settings.tenant_slug}


@app.get("/v1/humans")
def list_humans(
    status: str | None = Query(default=None),
    search: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
):
    humans = store().list_humans(status=status, search=search)
    return {"data": humans[offset : offset + limit], "total": len(humans), "page": offset // limit}


@app.get("/v1/humans/{human_id}")
def get_human(human_id: str):
    human = store().get_human(human_id)
    if not human:
        raise HTTPException(status_code=404, detail="Human not found")
    children = store().list_agents(owner_human_id=human.human_id)
    return {"data": human, "child_agents": children}


@app.get("/v1/agents")
def list_agents(
    status: str | None = Query(default=None),
    owner_human_id: str | None = Query(default=None),
    risk_min: float | None = Query(default=None),
):
    agents = store().list_agents(status=status, owner_human_id=owner_human_id)
    if risk_min is not None:
        agents = [agent for agent in agents if agent.risk_score >= risk_min]
    return {"data": agents, "total": len(agents)}


@app.get("/v1/agents/{agent_id}")
def get_agent(agent_id: str):
    agent = store().get_agent(agent_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    parent = store().get_human(agent.owner_human_id) if agent.owner_human_id else None
    return {"data": agent, "human_parent": parent}


@app.post("/v1/agents/{agent_id}/reassign", status_code=202)
def reassign_agent(agent_id: str, body: ReassignRequest):
    agent = store().get_agent(agent_id)
    new_owner = store().get_human(body.new_owner_human_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if not new_owner:
        raise HTTPException(status_code=404, detail="New owner not found")
    event = store().add_audit_event(
        "agent_reassign_queued",
        {"agent_id": agent.agent_id, "new_owner_human_id": new_owner.human_id, "reason": body.reason},
        target_agent_id=agent.agent_id,
    )
    return {"status": "accepted", "audit_event": event}


@app.get("/v1/policies")
def list_policies():
    return {"data": store().policies}


@app.post("/v1/runtime/evaluate")
def evaluate_runtime(body: RuntimeEvaluationRequest):
    agent = store().get_agent(body.agent_external_id)
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    decision = evaluate_runtime_policy(store(), agent, body.action)
    store().add_audit_event(
        "runtime_decision",
        {"request": body.model_dump(), "decision": decision.model_dump()},
        target_agent_id=agent.agent_id,
        source="runtime_gateway",
    )
    return decision


@app.post("/v1/webhooks/hris/termination", status_code=202)
def hris_termination_webhook(body: TerminationWebhook):
    plan = store().plan_termination_cascade(body.employee_id)
    if not plan["human"]:
        raise HTTPException(status_code=404, detail="Human not found")
    return {
        "status": "accepted",
        "human": plan["human"],
        "agents_affected": plan["agents_affected"],
        "recommended_actions": plan["recommended_actions"],
    }


@app.get("/v1/audit/events")
def list_audit_events():
    return {"data": store().audit_events, "total": len(store().audit_events)}


@app.get("/v1/demo/summary")
def demo_summary():
    agents = store().agents
    humans = store().humans
    return {
        "tenant": store().tenant_id,
        "humans": len(humans),
        "agents": len(agents),
        "orphaned_agents": len([agent for agent in agents if agent.status == "orphaned"]),
        "high_risk_agents": len([agent for agent in agents if agent.risk_score >= 70]),
        "policies": len(store().policies),
    }
