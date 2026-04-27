#!/usr/bin/env python3
"""
Pedigree Demo Data Seeder
Loads mock HRIS + Dataverse data into local Neo4j + Postgres for development/demo.
Usage: python scripts/seed_demo_data.py --tenant contoso-demo --reset
"""

import argparse
import json
import os
from datetime import datetime
from neo4j import GraphDatabase
import psycopg2
from psycopg2.extras import Json

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "demo", "mock_data")

def load_json(name):
    with open(os.path.join(DATA_DIR, name)) as f:
        return json.load(f)

def seed_graph(driver, tenant_id: str, humans: list, agents: list):
    with driver.session() as session:
        # Clear existing for this tenant (demo only)
        session.run("MATCH (n {tenant_id: $tenant}) DETACH DELETE n", tenant=tenant_id)

        # Humans + manager edges
        for h in humans:
            session.run("""
                CREATE (h:Human {
                    human_id: randomUUID(),
                    tenant_id: $tenant,
                    external_id: $ext_id,
                    email: $email,
                    full_name: $name,
                    department: $dept,
                    job_title: $title,
                    status: $status,
                    entitlements_snapshot: $entitlements
                })
            """, tenant=tenant_id, ext_id=h["employee_id"], email=h["email"],
                 name=h["full_name"], dept=h.get("department"), title=h.get("job_title"),
                 status=h["status"], entitlements=h.get("entitlements", []))

        # Link managers
        for h in humans:
            if h.get("manager_id"):
                session.run("""
                    MATCH (child:Human {tenant_id: $tenant, external_id: $child_id})
                    MATCH (mgr:Human {tenant_id: $tenant, external_id: $mgr_id})
                    CREATE (mgr)-[:MANAGES]->(child)
                """, tenant=tenant_id, child_id=h["employee_id"], mgr_id=h["manager_id"])

        # Agents
        for a in agents:
            owner_id = a["ownerid"]["azureactivedirectoryobjectid"]
            session.run("""
                MATCH (owner:Human {tenant_id: $tenant, external_id: $owner_ext})
                CREATE (a:Agent {
                    agent_id: randomUUID(),
                    tenant_id: $tenant,
                    external_id: $ext_id,
                    platform: 'copilot_studio',
                    name: $name,
                    description: $desc,
                    status: CASE WHEN $state = 0 THEN 'active' ELSE 'inactive' END,
                    scope_snapshot: $scope,
                    created_at: datetime($created),
                    risk_score: rand() * 60 + 10
                })
                CREATE (owner)-[:PARENT_OF {created_at: datetime($created)}]->(a)
            """, tenant=tenant_id, owner_ext=owner_id,
                 ext_id=a["botid"], name=a["name"], desc=a.get("description"),
                 state=a["statecode"], scope={"knowledge": a.get("knowledge_sources", []), "actions": a.get("actions", [])},
                 created=a["createdon"])

        print(f"Seeded {len(humans)} humans and {len(agents)} agents for tenant {tenant_id}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--tenant", default="contoso-demo")
    parser.add_argument("--reset", action="store_true")
    args = parser.parse_args()

    humans = load_json("hris_employees.json")
    agents = load_json("dataverse_bots.json")

    # Connect to local Neo4j (assumes docker-compose.demo.yml is running)
    driver = GraphDatabase.driver("bolt://localhost:7687", auth=("neo4j", "password"))

    seed_graph(driver, args.tenant, humans, agents)
    driver.close()

    print("Demo data seeded successfully. Open http://localhost:3000")

if __name__ == "__main__":
    main()