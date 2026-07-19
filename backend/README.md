# Backend — Restaurant API

Express + MongoDB. Same Vercel setup as **core-admin-hub/backend**.

## Local

```bash
cd backend
npm install
npm run setup
npm run dev
```

## Vercel

1. Root Directory: **`backend`**
2. Uses `vercel.json` → `server.js` as `@vercel/node`
3. Env: `MONGO_URI` (Atlas), `JWT_SECRET`, `FRONTEND_URL` (frontend site URL), `NODE_ENV=production`
