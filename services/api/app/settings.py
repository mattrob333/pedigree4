from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def ancestor(path: Path, index: int) -> Path | None:
    return path.parents[index] if len(path.parents) > index else None


def default_seed_data_path() -> Path:
    current_file = Path(__file__).resolve()
    repo_root = ancestor(current_file, 3)
    workspace_root = ancestor(current_file, 4)
    candidates = [
        Path("demo/mock_data"),
        repo_root / "demo" / "mock_data" if repo_root else None,
        workspace_root / "demo" / "mock_data" if workspace_root else None,
    ]
    valid_candidates = [candidate for candidate in candidates if candidate is not None]
    return next((candidate for candidate in valid_candidates if candidate.exists()), valid_candidates[0])


class Settings(BaseSettings):
    demo_mode: bool = True
    database_url: str = "postgresql://pedigree:demo@localhost:5432/pedigree_demo"
    neo4j_uri: str = "bolt://localhost:7687"
    redis_url: str = "redis://localhost:6379"
    mock_microsoft_url: str = "http://localhost:9000"
    tenant_slug: str = "contoso-demo"
    seed_data_path: Path = default_seed_data_path()

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
