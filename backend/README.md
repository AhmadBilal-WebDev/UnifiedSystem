# Backend

## Local
```bash
cd backend
npm install
npm run setup
npm run dev
```
Use active (uncommented) block in `.env`.

## Vercel (delightcrustbackend)
Paste the **commented Vercel block** from `.env` into Environment Variables.

Critical:
- `MONGO_URI` must include DB name: `...mongodb.net/delightcrust?...`
- `FRONTEND_URL=https://delightcrust.vercel.app`
- Redeploy after env changes

DB connects via middleware before every request (fixes cold-start login 500).
