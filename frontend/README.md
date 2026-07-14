# Frontend — Customer Website + Admin Dashboard

React (Vite) app. Runs on port **5173**.

## Local

```bash
cd frontend
npm install
npm run dev
```

Create `.env` (or copy `.env.example`):

```
VITE_API_URL=http://localhost:5000
```

## Vercel deploy

1. Import repo → set **Root Directory** to `frontend`
2. Framework: Vite
3. Env var: `VITE_API_URL` = your **live backend URL**  
   (e.g. `https://your-api.onrender.com` — NOT the Vercel frontend URL)
4. Redeploy after changing env vars

Without a separately deployed backend, login/API will fail (HTTP 405).

## Pages

| Page | URL |
|------|-----|
| Site | http://localhost:5173 |
| Admin | http://localhost:5173/admin |
