# Frontend — Customer Website + Admin Dashboard

Vite + React. Same Vercel setup as **core-admin-hub/frontend**.

## Local

```bash
cd frontend
npm install
npm run dev
```

`.env`:
```
VITE_API_URL=http://localhost:5000
```

## Vercel

1. Root Directory: **`frontend`**
2. Env: `VITE_API_URL` = your **backend** Vercel URL  
   (example: `https://unifiedsystem-api.vercel.app`)
3. Do **not** set `VITE_API_URL` to this frontend’s own URL
