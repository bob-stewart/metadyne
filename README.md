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

## Admin (gated write)

Metadyne is intentionally **public-read**. “Admin” actions are handled by a separate authenticated API deployed on Vercel.

### Vite env

Set in the Pages build (or local dev):

- `VITE_ADMIN_API_BASE` = `https://<your-vercel-app>.vercel.app`

### Vercel env (Admin API)

Deploy this same repo to Vercel and configure these env vars:

- `GITHUB_OAUTH_CLIENT_ID`
- `GITHUB_OAUTH_CLIENT_SECRET`
- `ADMIN_APP_URL` = `https://<your-vercel-app>.vercel.app`
- `ADMIN_RETURN_TO` = `https://bob-stewart.github.io/metadyne/`
- `ADMIN_ALLOW_GITHUB_LOGINS` = `bob-stewart`
- `MESHCORE_OWNER` = `bob-stewart`
- `MESHCORE_REPO` = `meshcore`
- `MESHCORE_BRANCH` = `main`

Admin writes are PR-as-transaction into MeshCORE (no silent mutation).
