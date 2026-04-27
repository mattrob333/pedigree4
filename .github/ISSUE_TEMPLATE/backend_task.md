---
name: Backend task
about: Build or review backend API, policy, data, or service behavior
title: "[Backend] "
labels: backend
assignees: ""
---

## Goal

Describe the backend outcome.

## Relevant paths

- `services/api/`
- `services/mock_microsoft/`
- `demo/mock_data/`
- `tests/unit/`

## Acceptance criteria

- [ ] Behavior is covered by tests.
- [ ] API response shape is documented or aligned with existing schemas.
- [ ] Demo-only assumptions are called out.
- [ ] CI-equivalent validation passes locally.

## Validation commands

```bash
python scripts/validate_structure.py
.\.venv\Scripts\python -m ruff check services tests scripts
.\.venv\Scripts\python -m pytest tests/unit
```
