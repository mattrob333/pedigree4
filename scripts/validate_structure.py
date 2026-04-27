from __future__ import annotations

import ast
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REQUIRED_PATHS = [
    "README.md",
    "api/openapi.yaml",
    "apps/web/index.html",
    "apps/web/demo.html",
    "apps/web/app.html",
    "apps/web/package.json",
    "apps/web/src/App.tsx",
    "apps/web/src/api.ts",
    "apps/web/src/main.tsx",
    "apps/web/src/types.ts",
    "services/api/app/main.py",
    "services/mock_microsoft/mock_server.py",
    "demo/mock_data/dataverse_bots.json",
    "demo/mock_data/hris_employees.json",
    "demo/mock_data/resources.json",
    "db/postgres/schema.sql",
    "db/neo4j/constraints.cypher",
    "docker-compose.demo.yml",
]


def main() -> None:
    missing = [path for path in REQUIRED_PATHS if not (ROOT / path).exists()]
    if missing:
        raise SystemExit(f"Missing required paths: {missing}")

    for path in list((ROOT / "services").rglob("*.py")) + list((ROOT / "tests").rglob("*.py")):
        ast.parse(path.read_text(encoding="utf-8-sig"), filename=str(path))

    for path in (ROOT / "demo" / "mock_data").glob("*.json"):
        json.loads(path.read_text(encoding="utf-8"))

    print("structure_ok")


if __name__ == "__main__":
    main()
