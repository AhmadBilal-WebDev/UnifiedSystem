# Backend — Restaurant API

Express + MongoDB. Runs on port **5000**.

## Structure

```
backend/
├── server.js              → start API
├── src/                   → routes, models, controllers
├── scripts/
│   ├── setup.mjs          → first-time DB seed
│   └── fix-admin-login.mjs
└── start-all.bat          → starts backend + frontend together
```

## First-time setup

```bash
cd backend
npm install
npm run setup
```

Admin login: `admin@delightcrust.com` / `Admin@123`  
URL: http://localhost:5173/admin

## Start

```bash
npm run dev
# or double-click start-all.bat (also starts frontend)
```

If login fails:

```bash
npm run fix-login
```

## .env

```
PORT=5000
MONGO_URI=...
JWT_SECRET=...
FRONTEND_URL=http://localhost:5173
```

On production, set `FRONTEND_URL` to your Vercel site URL.

## Deploy backend (required for Vercel frontend)

Vercel only hosts the frontend. Deploy this backend on **Render**, Railway, or similar:

1. Root Directory: `backend`
2. Start: `npm start`
3. Add same env vars (`MONGO_URI`, `JWT_SECRET`, `FRONTEND_URL`, …)
4. Put that API URL in frontend Vercel env as `VITE_API_URL`
