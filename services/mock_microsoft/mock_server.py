from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Annotated

from fastapi import FastAPI, Header, HTTPException, Query
from pydantic import BaseModel

app = FastAPI(title="Pedigree Mock Microsoft APIs", version="1.0-demo")

DATA_DIR = Path(__file__).resolve().parent / "mock_data"
FALLBACK_DATA_DIR = Path(__file__).resolve().parents[2] / "demo" / "mock_data"


def load_json(name: str) -> list[dict]:
    path = DATA_DIR / name
    if not path.exists():
        path = FALLBACK_DATA_DIR / name
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


BOTS = load_json("dataverse_bots.json")
HRIS_EMPLOYEES = {employee["employee_id"]: employee for employee in load_json("hris_employees.json")}
ENTRA_USERS = {
    employee.get("entra_id") or f"{employee['email'].split('@')[0].replace('.', '-')}-entra-id": {
        "id": employee.get("entra_id") or f"{employee['email'].split('@')[0].replace('.', '-')}-entra-id",
        "userPrincipalName": employee["email"],
        "mail": employee["email"],
        "displayName": employee["full_name"],
        "department": employee.get("department"),
        "jobTitle": employee.get("job_title"),
        "employeeId": employee["employee_id"],
        "accountEnabled": employee.get("status") == "active",
    }
    for employee in HRIS_EMPLOYEES.values()
}
RESOURCES = load_json("resources.json")
AGENT_STATE = {bot["botid"]: bot for bot in BOTS}


class ReassignRequest(BaseModel):
    NewOwnerAadUserId: str


@app.get("/demo/health")
def health():
    return {"status": "ok", "mock": True, "tenants": ["contoso-demo"]}


@app.get("/api/data/v9.2/bots")
def list_bots(
    odata_filter: Annotated[str | None, Query(alias="$filter")] = None,
    odata_expand: Annotated[str | None, Query(alias="$expand")] = None,
    odata_top: Annotated[int, Query(alias="$top", ge=1, le=500)] = 50,
    authorization: Annotated[str | None, Header()] = None,
):
    results = list(AGENT_STATE.values())[:odata_top]
    return {
        "value": results,
        "@odata.count": len(AGENT_STATE),
        "@pedigree.mock": {
            "filter": odata_filter,
            "expand": odata_expand,
            "authorized": bool(authorization),
        },
    }


@app.patch("/api/data/v9.2/bots({botid})")
def update_bot(botid: str, body: dict):
    if botid not in AGENT_STATE:
        raise HTTPException(status_code=404, detail="Bot not found")
    AGENT_STATE[botid].update(body)
    return {"@odata.etag": "W/\"123456\""}


@app.post("/copilotstudio/environments/{env_id}/bots/{bot_id}/api/botAdminOperations/reassign")
def reassign_agent(env_id: str, bot_id: str, body: ReassignRequest):
    if bot_id not in AGENT_STATE:
        raise HTTPException(status_code=404, detail="Agent not found")
    old_owner = AGENT_STATE[bot_id].get("ownerid", {}).get("azureactivedirectoryobjectid")
    new_owner = body.NewOwnerAadUserId
    AGENT_STATE[bot_id]["ownerid"] = {
        "azureactivedirectoryobjectid": new_owner,
        "internalemailaddress": ENTRA_USERS.get(new_owner, {}).get("userPrincipalName", "unknown@contoso.com"),
    }
    AGENT_STATE[bot_id]["statecode"] = 1
    AGENT_STATE[bot_id]["statuscode"] = 2
    return {
        "status": "accepted",
        "environment_id": env_id,
        "bot_id": bot_id,
        "reassigned_from": old_owner,
        "reassigned_to": new_owner,
        "timestamp": datetime.now(UTC).isoformat(),
    }


@app.get("/v1.0/users/{user_id}")
def get_user(user_id: str):
    user = ENTRA_USERS.get(user_id) or next(
        (candidate for candidate in ENTRA_USERS.values() if candidate.get("userPrincipalName") == user_id),
        None,
    )
    if not user:
        raise HTTPException(status_code=404, detail="User not found in mock")
    return user


@app.get("/v1.0/users")
def list_users(
    odata_filter: Annotated[str | None, Query(alias="$filter")] = None,
    odata_top: Annotated[int, Query(alias="$top", ge=1, le=500)] = 50,
):
    return {"value": list(ENTRA_USERS.values())[:odata_top], "@pedigree.mock_filter": odata_filter}


@app.get("/v1.0/groups")
def list_groups():
    return {
        "value": [
            {"id": "group-finance", "displayName": "Finance Team"},
            {"id": "group-it", "displayName": "IT Platform"},
        ]
    }


@app.get("/v1.0/sites")
def list_sites():
    sites = [resource for resource in RESOURCES if resource.get("type") == "sharepoint_site"]
    return {"value": sites}


@app.get("/entra/agent-id/identities")
def list_agent_identities():
    return {"value": [agent for agent in AGENT_STATE.values() if agent.get("entra_agent_object_id")]}


@app.post("/demo/seed")
def seed_demo(body: dict | None = None):
    body = body or {}
    return {
        "status": "seeded",
        "tenant": body.get("tenant", "contoso-demo"),
        "humans": body.get("humans", len(HRIS_EMPLOYEES)),
        "agents": body.get("agents", len(AGENT_STATE)),
        "message": "Demo data refreshed. Refresh UI.",
    }


@app.get("/demo/agents/{agent_id}/simulate_termination")
def simulate_termination(agent_id: str):
    if agent_id not in AGENT_STATE:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {
        "cascade_triggered": True,
        "agents_affected": 3,
        "new_owner": "compliance-archive@contoso.com",
        "reassign_api_response": "202 Accepted",
        "audit_bundle_id": f"audit-{datetime.now(UTC).strftime('%Y%m%d%H%M%S')}",
    }
