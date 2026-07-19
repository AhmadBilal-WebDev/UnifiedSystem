/**
 * Backend origin for API calls.
 *
 * Local:  VITE_API_URL=http://localhost:5000
 * Vercel: VITE_API_URL=https://your-backend.vercel.app
 *         (same pattern as core-admin-hub)
 */
export function getApiBase() {
  const raw = import.meta.env.VITE_API_URL;
  if (raw !== undefined && raw !== null && String(raw).trim() !== "") {
    return String(raw).replace(/\/$/, "");
  }
  return "http://localhost:5000";
}

/** Base for dashboard routes that already include `/api` in the path */
export function getApiRoot() {
  return `${getApiBase()}/api`;
}
