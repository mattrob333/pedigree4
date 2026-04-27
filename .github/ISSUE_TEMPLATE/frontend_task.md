---
name: Frontend task
about: Build or review frontend UI, prototype migration, or API-backed screens
title: "[Frontend] "
labels: frontend
assignees: ""
---

## Goal

Describe the frontend outcome.

## Relevant paths

- `apps/web/src/`
- `apps/web/app.html`
- `apps/web/index.html`
- `apps/web/demo.html`
- `apps/web/public/`

## Acceptance criteria

- [ ] Existing visual direction is preserved or intentionally evolved.
- [ ] API-backed behavior handles loading and error states.
- [ ] TypeScript typecheck passes.
- [ ] Vite production build passes.

## Validation commands

```bash
npm run typecheck --workspace @pedigree/web
npm run build --workspace @pedigree/web
```
