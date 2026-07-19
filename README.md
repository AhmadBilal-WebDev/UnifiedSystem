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

`backend/.env`:
```
MONGO_URI=...
JWT_SECRET=...
FRONTEND_URL=http://localhost:5173
```

## Vercel deploy (same as core-admin-hub — 2 projects)

### 1) Backend

1. New Vercel project → Root Directory = **`backend`**
2. Env vars: `MONGO_URI` (Atlas), `JWT_SECRET`, `FRONTEND_URL` (frontend Vercel URL), `NODE_ENV=production`
3. Deploy → copy URL, e.g. `https://unifiedsystem-api.vercel.app`

### 2) Frontend

1. New Vercel project → Root Directory = **`frontend`**
2. Env var: `VITE_API_URL` = backend URL from step 1  
   (**not** the frontend URL — that caused HTTP 405 before)
3. Deploy

| Project   | Root Directory | Important env                          |
|-----------|----------------|----------------------------------------|
| Backend   | `backend`      | `MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL` |
| Frontend  | `frontend`     | `VITE_API_URL` = backend Vercel URL    |

## URLs

| App        | Local                         |
|------------|-------------------------------|
| Site       | http://localhost:5173         |
| Admin      | http://localhost:5173/admin   |
| API        | http://localhost:5000         |
