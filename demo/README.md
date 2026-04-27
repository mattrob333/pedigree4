# Pedigree Demo & Mock Environment

**Goal:** Run a fully functional Pedigree instance locally with realistic fake data (no real Microsoft or HRIS accounts needed). Perfect for development, testing, internal demos, and design partner rehearsals.

---

## Quick Start (5 minutes)

```bash
# 1. Start everything with Docker Compose (includes Neo4j, Postgres, Redis, Mock Microsoft APIs)
docker compose -f docker-compose.demo.yml up -d

# 2. Seed the demo data (Contoso Financial - 500 humans, 150 agents, realistic org chart)
python scripts/seed_demo_data.py --tenant contoso-demo

# 3. Open UI
open http://localhost:3000

# 4. Login with demo credentials (any Entra-like email from the seed data, e.g. jane.doe@contoso.com)
# Password: demo123 (or use magic link in dev)

# 5. Explore:
# - Dashboard → See live org chart with 150 agents attributed
# - Orphans → 12 agents with terminated owners
# - Simulate Termination → Pick a manager, watch cascade in real-time
# - App Owner Console → View SharePoint/Dataverse resources with agent access
# - Runtime Demo → Trigger sample "CreateVendor + ApprovePayment" action (blocked on SoD)
```

---

## What's Included in the Demo Dataset (Contoso Financial)

**Company:** Contoso Financial Services (fictional Microsoft-style enterprise, 1,200 employees, Fortune 500-like).

**Humans (500 in graph):**
- CEO + 8 VPs
- Finance (120 people): Managers, Analysts, Controllers
- IT / Platform (80)
- HR (45)
- Sales & Operations (remaining)
- Realistic manager chain, dotted-line relationships, termination dates for ~40 people (creating orphans)

**Agents (150 total):**
- 120 Copilot Studio agents (topics, knowledge sources, actions)
- 20 Entra Agent ID registered agents
- 10 "custom" / legacy agents (orphaned or mis-attributed)
- Realistic scopes: Finance agents have access to vendor/Payments systems, IT agents have broad access, etc.
- 12 orphans (owners terminated >30 days ago)

**Resources (for App Owner Console):**
- 25 SharePoint sites (Finance, Legal, HR, etc.)
- 15 Dataverse tables (Vendors, Payments, Employees, etc.)
- 8 Power Automate flows

**Pre-loaded Policies:**
- Finance SoD: Cannot own agent that does both "CreateVendor" + "ApprovePayment"
- Scope Cap: No agent owned by individual contributor can have write access to Payments table
- Lifecycle: Agents owned by terminated humans auto-flagged

**Demo Accounts (login with any of these):**
- jane.doe@contoso.com (Finance Manager, owns 14 agents)
- michael.chen@contoso.com (VP Finance, owns 47 agents + subtree)
- terminated user examples for cascade demo

---

## Mock Microsoft Environment

The `demo/mock_server.py` (or Docker service) simulates:
- **Dataverse Web API**: `GET /bots`, `PATCH /bots/{id}`, `POST /botAdminOperations/reassign`
- **Microsoft Graph**: `/users`, `/groups`, user manager, SharePoint sites
- **Power Platform Reassign API**: Returns 202 Accepted, updates mock state
- **Entra Agent ID**: Returns agent identities with sponsor + blueprint

All responses are deterministic and realistic. You can inspect/modify the mock data in `demo/mock_data/`.

**Files:**
- `demo/mock_data/hris_employees.json` — 500 humans with manager chain, termination dates
- `demo/mock_data/dataverse_bots.json` — 150 agents with ownerid, createdby, knowledge_sources, actions
- `demo/mock_data/entra_users.json` — Entra profiles + AadUserIds matching HRIS
- `demo/mock_data/resources.json` — SharePoint + Dataverse resources

---

## Running in "Real" Mode vs Demo Mode

**Demo Mode (default for local dev):**
- Uses mock connectors (no real API calls)
- Fast seed/re-seed
- Perfect for UI/UX work and internal testing

**Real Mode (for PoC with design partner):**
- Toggle `DEMO_MODE=false` in `.env`
- Provide real Entra app credentials + Dataverse env ID + Workday sandbox
- Same UI and APIs — only the data source changes

**Config:**
```env
DEMO_MODE=true
MOCK_TENANT=contoso-demo
SEED_DATA_PATH=./demo/mock_data
```

---

## Advanced Demo Features

- **Live Cascade Simulation:** Click "Terminate User" in UI → watch real-time updates in graph + audit log + "reassign API" calls logged.
- **Policy Playground:** Create/test new SoD or scope rules and see immediate impact on existing agents.
- **Orphan Resolution:** Bulk or individual parenting with ML suggestions.
- **Audit Export:** Generate SOX-style bundle for any terminated human.
- **Load Testing Mode:** Button to simulate 50 simultaneous terminations (stress test cascade logic).

---

## How to Extend the Mock Data

1. Edit JSON files in `demo/mock_data/`
2. Run `python scripts/seed_demo_data.py --reset --tenant contoso-demo`
3. Refresh UI

Or use the admin API:
```bash
curl -X POST http://localhost:8000/demo/seed \
  -H "Authorization: Bearer demo-token" \
  -d '{"tenant": "contoso-demo", "humans": 500, "agents": 150}'
```

---

## Troubleshooting

- **Graph looks empty:** Run seed script again (it’s idempotent).
- **Mock server not responding:** Check `docker compose logs mock-microsoft`.
- **Want different company size:** Edit seed script parameters or JSON files.

This mock environment makes Pedigree fully demo-able and testable on any laptop without Microsoft accounts, Workday access, or real customer data. It’s realistic enough that design partners often can’t tell it’s mocked until told.

**Next:** Use this for internal team demos, investor updates, and the Wesco PoC rehearsal. When ready for real data, flip the switch to production connectors.