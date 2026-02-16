# Metadyne

Metadyne is a **public-read / gated-write** dashboard over **MeshCORE**.

- Canonical data source: <https://github.com/bob-stewart/meshcore>
- Current state: read-only IRB Inbox + Improvement Backlog (Kanban-ish)
- Planned: gated writes via **PR-as-transaction** (no silent mutation)

## Run locally

```bash
npm install
npm run dev
```

## Configure MeshCORE source

Optional env vars:

- `VITE_MESHCORE_OWNER` (default: `bob-stewart`)
- `VITE_MESHCORE_REPO` (default: `meshcore`)
- `VITE_MESHCORE_BRANCH` (default: `main`)

## Deploy

A GitHub Pages workflow is included at `.github/workflows/pages.yml`.
# redeploy 2026-02-16T05:03:05Z
