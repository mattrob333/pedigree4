# For Dummies — Pedigree Explainers

Plain-English walkthroughs of the architectural and engineering decisions in this repo. Every file in this folder is named `<topic>_for_dummies.md` and is written for a non-developer reader who wants to understand *what something is*, *why we chose it*, and *how it shows up in our actual code*.

The bar:
- No undefined jargon. If a term has to be used, it's defined the first time.
- Every concept is anchored in a real file, endpoint, or commit in this repo — not abstract examples.
- Short, conversational, and skimmable.

## Index

| Topic | File |
|---|---|
| API endpoints, the three directions data flows, and how testing/mocking works | [`api_and_data_flow_for_dummies.md`](api_and_data_flow_for_dummies.md) |

## Adding a new explainer

1. Pick a topic that's currently fuzzy in your head. Good candidates: graph databases vs relational databases, what a "schema" actually is, what Docker is doing for us, what CI/CD means in practice, how authentication will work in v1.1, what an MCP gateway is.
2. Create `docs/for_dummies/<topic>_for_dummies.md`.
3. Add a row to the index above.
4. Format guideline: lead with a one-sentence answer, then build up. Use small tables and ASCII diagrams over walls of prose.
