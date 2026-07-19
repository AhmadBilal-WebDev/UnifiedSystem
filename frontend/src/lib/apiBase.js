/**
 * Backend API origin — same idea as core-admin-hub (VITE_BACKEND_URL).
 *
 * Local:  http://localhost:5000
 * Vercel: https://delightcrustbackend.vercel.app
 *
 * Never use the frontend URL (https://delightcrust.vercel.app) — that causes HTTP 405.
 */
const LOCAL_API = "http://localhost:5000";
const PROD_API = "https://delightcrustbackend.vercel.app";
const FRONTEND_SITE = "https://delightcrust.vercel.app";

function normalize(url) {
  return String(url || "")
    .trim()
    .replace(/\/$/, "");
}

function isFrontendSite(url) {
  const u = normalize(url).toLowerCase();
  if (!u) return false;
  // Backend host is fine
  if (u.includes("delightcrustbackend")) return false;
  // SPA site must never be used as API base
  return (
    u === FRONTEND_SITE.toLowerCase() ||
    u === "http://localhost:5173" ||
    /^https?:\/\/delightcrust\.vercel\.app$/i.test(u)
  );
}

export function getApiBase() {
  const fromEnv = normalize(
    import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "",
  );

  if (fromEnv && !isFrontendSite(fromEnv)) {
    return fromEnv;
  }

  // Dev → local Express; production build → real backend
  return import.meta.env.DEV ? LOCAL_API : PROD_API;
}

/** Dashboard paths already start after /api */
export function getApiRoot() {
  return `${getApiBase()}/api`;
}
