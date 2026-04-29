# API Endpoints & Data Flow — For Dummies

A plain-English walkthrough of what "the API" actually is in this codebase, how data moves between the client's systems / the AI agent / our backend / our frontend, and how real developers test that flow with mocks.

If you only remember one thing: **the API is a contract**. Any system — Microsoft Copilot, Make.com, n8n, Anthropic, a custom-built agent, your own browser — talks to Pedigree by sending JSON in a shape we agreed on, to a URL we documented. That's it. Everything else is implementation detail.

---

## 1. What is an API endpoint, really

An **endpoint** is a URL + an HTTP verb (`GET`, `POST`, etc.) that does *one specific thing*. Think of it like a phone extension at a company switchboard.

When uvicorn started, our FastAPI backend opened a "switchboard" at `http://localhost:8000`. Inside it are extensions like:

| Verb + Path | What it does | Who calls it |
|---|---|---|
| `GET  /v1/humans` | list employees | the frontend (to render the org chart) |
| `GET  /v1/agents` | list AI agents | the frontend (to render the agent panel) |
| `GET  /v1/agents/{id}` | full detail on one agent | the frontend (when user clicks a row) |
| `POST /v1/agents/{id}/reassign` | change the human owner of an agent | the frontend (button click), or an admin script |
| `POST /v1/runtime/evaluate` | "is this agent allowed to take this action right now?" | **the agent itself**, at runtime |
| `POST /v1/webhooks/hris/termination` | "this employee was just fired" | **the HRIS system** (Workday/UKG), automatically |
| `GET  /v1/audit/events` | list of every decision Pedigree ever made | the frontend, or Splunk/Sentinel |

So when a developer says "play with the endpoints," they literally mean: open Swagger at http://localhost:8000/docs and click the "Try it out" button on each one to see what request it accepts and what response it returns. That's how anyone learns a new API.

---

## 2. The three directions data flows (this is the part most people get half-right)

It's tempting to picture one big arrow — "Microsoft sends data, we display it." That's roughly true, but the reality is **three different directions**, each with a different driver and different security implications:

```
                   ┌──────────────────────────────────────┐
                   │           Pedigree API               │
                   │     (FastAPI, port 8000)             │
                   └──────────────────────────────────────┘
                       ▲           ▲              │
            (1) ingest │ (2) runtime│       (3)   │ read
                       │           │              ▼
   ┌───────────────────┴──┐  ┌─────┴──────┐  ┌──────────┐
   │ Client systems       │  │ The agent  │  │ Frontend │
   │ (Workday, Microsoft  │  │ at runtime │  │ React UI │
   │  Graph, Dataverse,   │  │            │  │          │
   │  HRIS webhooks)      │  │            │  │          │
   └──────────────────────┘  └────────────┘  └──────────┘
```

### Direction 1 — Ingestion (client systems → us)

Two sub-patterns:

- **Pull**: *we* go ask. On a schedule (say every 15 minutes), our ingestion service calls Microsoft Graph / Dataverse and asks "give me your current bot list." We map their fields into our `Agent` records.
- **Push**: *they* tell us. The client configures Workday to fire a webhook at our `POST /v1/webhooks/hris/termination` endpoint the instant an employee is fired. The payload arrives as JSON; our endpoint parses it, looks up that human in our graph, finds every agent owned by them, and triggers the cascade.

Both happen on the **server side**. The browser/frontend is not involved.

### Direction 2 — Runtime enforcement (the agent → us)

This is the one that confuses people. When a Copilot Studio bot is about to take an action — say, "read this SharePoint doc" — it can be configured (via a custom connector or proxy) to **first** call our `POST /v1/runtime/evaluate` and ask "should I be allowed to do this?" Our endpoint:

1. Looks up the agent's parent human in the graph.
2. Checks the parent's *current* entitlements (because the human might have moved teams since the agent was created).
3. Runs the segregation-of-duties policy.
4. Returns `allow` / `block` / `escalate`.

The agent then proceeds or stops based on the answer. Every one of these calls is logged. This is the "runtime gateway" referred to in the architecture docs.

### Direction 3 — Read (frontend → us)

This is what you saw misbehave with the CORS error earlier. The React app loads in a browser and, on mount, fires off:

- `GET /v1/demo/summary`
- `GET /v1/humans?limit=100`
- `GET /v1/agents`

The shapes of those JSON responses are defined in `services/api/app/schemas.py` and documented in `api/openapi.yaml`, and the frontend has matching TypeScript types in `apps/web/src/types.ts`. If the shapes don't agree, you get a runtime crash in the UI (review finding **FE-03**).

---

## 3. So how does a "Microsoft Copilot agent" actually appear in our UI?

End-to-end, today (in our scaffold):

1. The seed script in `demo/mock_data/` writes a JSON file pretending to be Microsoft's response.
2. When uvicorn boots, `services/api/app/demo_store.py` reads that JSON into memory and shapes it into `Agent` objects matching our schema.
3. The browser calls `GET /v1/agents`. FastAPI returns the list.
4. `apps/web/src/App.tsx` receives that JSON, stores it in React state, and renders rows.

In production, step 1 would be replaced by a real ingestion service that calls Microsoft Graph. **Steps 2–4 don't change.** That's why the demo is useful — the contract between "data lands in our store" and "UI renders it" is the same whether the data came from a real Microsoft tenant or a JSON file.

---

## 4. How real developers test this — and what "mocking" means

Yes, your instinct is correct: **you mock the upstream system.** A "mock" is a small fake program that pretends to be (Microsoft / Workday / n8n / whatever) and returns canned responses, so we can test our code without depending on a live external system.

There are three levels of testing, each with a different scope:

| Level | What it tests | How it mocks |
|---|---|---|
| **Unit** | One function in isolation | Pass in fake Python objects directly. Example: `tests/unit/test_demo_api.py` calls our policy logic with a hand-crafted `Agent` and asserts the verdict. No HTTP, no DB. |
| **Integration** | Several pieces wired together | Start the FastAPI app in a test process, hit real endpoints with `httpx`, but point the "Microsoft" calls at a fake. We literally have one: `services/mock_microsoft/mock_server.py` is a tiny FastAPI app that pretends to be Dataverse + Graph. In docker-compose, the API talks to that mock instead of real Microsoft. |
| **End-to-end** | Whole stack including UI | Spin everything up, drive a real browser with Playwright/Cypress, click buttons, assert what's on screen. Slow but catches things the lower tiers miss. |

The pattern of "create a mock payload from Copilot/Make/n8n/whatever and feed it into our API to verify it maps correctly to the dashboard" — that's an **integration test**, and that's the right intuition. In practice it looks like:

```python
# pseudo-code for an integration test
def test_terminated_human_orphans_their_agents():
    # 1. Seed fake data: 1 human, 2 agents owned by them
    seed(...)
    # 2. Fire the same payload Workday would send
    response = client.post(
        "/v1/webhooks/hris/termination",
        json={"human_id": "h-123", "effective_date": "2026-04-28"},
    )
    # 3. Assert: both agents are now flagged as orphaned
    assert client.get("/v1/agents").json()[0]["status"] == "orphaned"
    # 4. Assert: an audit event was written
    assert len(client.get("/v1/audit/events").json()) == 1
```

The "fake payload" is a tiny JSON blob. The test doesn't care that no real Workday exists — it just cares that **if Workday sent this shape, our system reacts correctly.** That's the whole game.

---

## TL;DR mental model

- **An endpoint is a URL that does one thing.** Browse them at http://localhost:8000/docs.
- **Data flows in three directions:** ingestion (clients → us), runtime (agent → us, on every action), read (frontend → us).
- **The UI is "dumb" on purpose.** It just renders whatever shape the API returns. If the shape is wrong, the UI breaks — which is why the OpenAPI contract matters.
- **To test, you mock the upstream.** A mock is just a tiny program that pretends to be Microsoft (or Workday, or n8n, etc.) and returns canned responses. We already have one for Microsoft; we'd add similar mocks for any other agent platform we support.
- **The contract is the API.** As long as Microsoft, Make, n8n, Anthropic, and whoever else can deliver data in the shape our endpoints expect, we don't care which tool it came from.

That last bullet is the most important one strategically: **Pedigree's value is being the universal governance layer**, which means our API is platform-agnostic by design. Adding "Make.com support" mostly means writing a small adapter that translates Make's webhook shape into our agent schema.

---

## Files referenced in this explainer

- `services/api/app/main.py` — where every endpoint is defined
- `services/api/app/schemas.py` — Pydantic models that define the JSON shapes
- `services/api/app/demo_store.py` — the in-memory data store the demo uses
- `apps/web/src/App.tsx` — frontend that calls the read endpoints
- `apps/web/src/api.ts` — the small wrapper that does `fetch()` calls
- `apps/web/src/types.ts` — TypeScript mirrors of the API response shapes
- `services/mock_microsoft/mock_server.py` — our fake Microsoft service
- `tests/unit/test_demo_api.py` — example unit tests
- `api/openapi.yaml` — the formal API contract
