# UnifiedSystem — Customer Site + Restaurant Dashboard

Same layout as **core-admin-hub**: only `frontend/` and `backend/`.

```
UnifiedSystem/
├── frontend/   → customer website + restaurant admin (Vite)
└── backend/    → Express API
```

## Flow

1. **Super admin** (core-admin-hub) adds a restaurant + branches  
2. Those restaurants/branches appear for the **restaurant admin / customers** in this app  
3. This app’s backend serves menu, orders, and restaurant dashboard APIs  

## Local

```bash
# Terminal 1 — API
cd backend
npm install
npm run setup   # first time only
npm run dev     # http://localhost:5000

# Terminal 2 — UI
cd frontend
npm install
npm run dev     # http://localhost:5173
```

`frontend/.env`:
```
VITE_API_URL=http://localhost:5000
```

`backend/.env` (local active; Vercel block is commented inside the same file):
```
MONGO_URI=...
JWT_SECRET=...
FRONTEND_URL=http://localhost:5173
```

Vercel URLs:
- Frontend: https://delightcrust.vercel.app
- Backend: https://delightcrustbackend.vercel.app

## Vercel deploy (same as core-admin-hub — 2 projects)

### 1) Backend

1. New Vercel project → Root Directory = **`backend`**
2. Paste env vars from `backend/.env` (use Atlas for `MONGO_URI`, set `FRONTEND_URL` to frontend Vercel URL, `NODE_ENV=production`, `COOKIE_SECURE=true`)
3. Deploy → copy URL, e.g. `https://unifiedsystem-api.vercel.app`

### 2) Frontend

1. New Vercel project → Root Directory = **`frontend`**
2. Env var: `VITE_API_URL` = backend URL from step 1
3. Deploy

| Project   | Root Directory | Important env                                      |
|-----------|----------------|----------------------------------------------------|
| Backend   | `backend`      | All from `.env` (Atlas `MONGO_URI`, `FRONTEND_URL`) |
| Frontend  | `frontend`     | `VITE_API_URL` = backend Vercel URL                |

> Do **not** add `VERCEL` to `.env`. Vercel sets that automatically if needed; this app does not use it.

## URLs

| App        | Local                         |
|------------|-------------------------------|
| Site       | http://localhost:5173         |
| Admin      | http://localhost:5173/admin   |
| API        | http://localhost:5000         |
