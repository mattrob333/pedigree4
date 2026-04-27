from fastapi.testclient import TestClient

from services.api.app.main import app


def test_demo_summary_loads_seed_data():
    with TestClient(app) as client:
        response = client.get("/v1/demo/summary")

    assert response.status_code == 200
    payload = response.json()
    assert payload["humans"] >= 1
    assert payload["agents"] >= 1
    assert payload["policies"] == 3


def test_orphaned_agent_policy_blocks_runtime_action():
    with TestClient(app) as client:
        agents = client.get("/v1/agents", params={"status": "orphaned"}).json()["data"]
        response = client.post(
            "/v1/runtime/evaluate",
            json={"agent_external_id": agents[0]["external_id"], "action": "GrantAccess", "context": {}},
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["decision"] == "block"
    assert "human parent" in payload["reason"]


def test_hris_termination_creates_cascade_plan():
    with TestClient(app) as client:
        response = client.post(
            "/v1/webhooks/hris/termination",
            json={"employee_id": "EMP001", "termination_date": "2026-04-27T13:00:00Z"},
        )

    assert response.status_code == 202
    payload = response.json()
    assert payload["human"]["external_id"] == "EMP001"
    assert len(payload["recommended_actions"]) >= 1
