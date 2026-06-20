/**
 * RestaurantOS — API Service Layer
 * Replaces static mockData with real backend calls.
 *
 * Usage: import api from './api';
 *        const data = await api.dashboard.getStats();
 */

const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:5000/api";

// ─── Token management ─────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("ros_admin_token");
export const setToken = (t) => localStorage.setItem("ros_admin_token", t);
export const clearToken = () => localStorage.removeItem("ros_admin_token");

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function request(method, path, body = null, isPublic = false) {
  const headers = { "Content-Type": "application/json" };
  if (!isPublic) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const opts = { method, headers };
  if (body && method !== "GET") opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

const get    = (path, isPublic) => request("GET",    path, null, isPublic);
const post   = (path, body)     => request("POST",   path, body);
const put    = (path, body)     => request("PUT",    path, body);
const patch  = (path, body)     => request("PATCH",  path, body);
const del    = (path)           => request("DELETE", path);

// ─── Query string builder ─────────────────────────────────────────────────────
const qs = (params = {}) => {
  const filtered = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));
  const s = new URLSearchParams(filtered).toString();
  return s ? `?${s}` : "";
};

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const auth = {
  login:         (email, password)     => post("/admin/login",           { email, password }),
  forgotPassword: (email)              => post("/admin/forgot-password", { email }),
  resetPassword:  (token, password)    => post("/admin/reset-password",  { token, password }),
  getMe:          ()                   => get("/admin/me"),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const dashboard = {
  getStats:       (params) => get(`/admin/dashboard/stats${qs(params)}`),
  getRevenueChart:(params) => get(`/admin/dashboard/revenue-chart${qs(params)}`),
  getTopSelling:  (params) => get(`/admin/dashboard/top-selling${qs(params)}`),
  getLatestOrders:(params) => get(`/admin/dashboard/latest-orders${qs(params)}`),
  getOrderSources:(params) => get(`/admin/dashboard/order-sources${qs(params)}`),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orders = {
  getAll:          (params) => get(`/admin/orders${qs(params)}`),
  getById:         (id)     => get(`/admin/orders/${id}`),
  create:          (body)   => post("/admin/orders", body),
  getHistory:      (params) => get(`/admin/orders/history${qs(params)}`),
  getCounterPending:(params)=> get(`/admin/orders/counter/pending${qs(params)}`),
  getKitchen:      (params) => get(`/admin/orders/kitchen${qs(params)}`),
  updateStatus:    (id, status) => patch(`/admin/orders/${id}/status`, { status }),
  accept:          (id)     => patch(`/admin/orders/${id}/accept`, {}),
  reject:          (id, reason) => patch(`/admin/orders/${id}/reject`, { reason }),
  logCallAttempt:  (id)     => patch(`/admin/orders/${id}/call-attempt`, {}),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const products = {
  getAll:   (params) => get(`/admin/products${qs(params)}`),
  getById:  (id)     => get(`/admin/products/${id}`),
  create:   (body)   => post("/admin/products", body),
  update:   (id, body) => put(`/admin/products/${id}`, body),
  delete:   (id)     => del(`/admin/products/${id}`),
  toggle:   (id)     => patch(`/admin/products/${id}/toggle`, {}),
  getMenu:  (branchId) => get(`/menu?branchId=${branchId}`, true), // public
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categories = {
  getAll:  (params) => get(`/admin/categories${qs(params)}`),
  create:  (body)   => post("/admin/categories", body),
  update:  (id, body) => put(`/admin/categories/${id}`, body),
  delete:  (id)     => del(`/admin/categories/${id}`),
};

// ─── Branches ─────────────────────────────────────────────────────────────────
export const branches = {
  getAll:     (params) => get(`/admin/branches${qs(params)}`),
  getById:    (id)     => get(`/admin/branches/${id}`),
  create:     (body)   => post("/admin/branches", body),
  update:     (id, body) => put(`/admin/branches/${id}`, body),
  delete:     (id)     => del(`/admin/branches/${id}`),
  addArea:    (id, area) => patch(`/admin/branches/${id}/areas`, { area }),
  removeArea: (id, area) => request("DELETE", `/admin/branches/${id}/areas`, { area }),
  getPublic:  (params) => get(`/branches${qs(params)}`, true),
};

// ─── Staff ────────────────────────────────────────────────────────────────────
export const staff = {
  getAll:           (params) => get(`/admin/staff${qs(params)}`),
  create:           (body)   => post("/admin/staff", body),
  update:           (id, body) => put(`/admin/staff/${id}`, body),
  updatePermissions:(id, permissions) => patch(`/admin/staff/${id}/permissions`, { permissions }),
  toggleStatus:     (id)     => patch(`/admin/staff/${id}/toggle-status`, {}),
  delete:           (id)     => del(`/admin/staff/${id}`),
};

// ─── Inventory ────────────────────────────────────────────────────────────────
export const inventory = {
  getAll:   (params) => get(`/admin/inventory${qs(params)}`),
  create:   (body)   => post("/admin/inventory", body),
  update:   (id, body) => put(`/admin/inventory/${id}`, body),
  restock:  (id, qty) => patch(`/admin/inventory/${id}/restock`, { qty }),
  delete:   (id)     => del(`/admin/inventory/${id}`),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analytics = {
  getSummary: (params) => get(`/admin/analytics/summary${qs(params)}`),
  getReports: (params) => get(`/admin/analytics/reports${qs(params)}`),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = {
  getAll:      () => get("/admin/notifications"),
  markRead:    (id) => patch(`/admin/notifications/${id}/read`, {}),
  markAllRead: ()   => patch("/admin/notifications/read-all", {}),
};

// ─── Customer (public / customer-facing) ─────────────────────────────────────
export const customer = {
  signup:       (body)   => post("/users/signup", body),
  login:        (body)   => post("/users/login", body),
  directReset:  (email)  => post("/users/direct-reset", { email }),
  placeOrder:   (body)   => post("/users/orders", body),
  getMyOrders:  ()       => get("/users/orders"),
  getProfile:   ()       => get("/users/profile"),
  updateProfile:(body)   => put("/users/profile", body),
};

// ─── POS ──────────────────────────────────────────────────────────────────────
export const pos = {
  getTransactions: (params)        => get(`/admin/pos/transactions${qs(params)}`),
  sync:             (body)         => post("/admin/pos/sync", body),
  getStatus:        (branchId)     => get(`/admin/pos/status/${branchId}`),
  updateSettings:   (branchId, body) => patch(`/admin/pos/settings/${branchId}`, body),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reports = {
  getDaily:     (params) => get(`/admin/reports/daily${qs(params)}`),
  getMonthly:   (params) => get(`/admin/reports/monthly${qs(params)}`),
  getCustomers: (params) => get(`/admin/reports/customers${qs(params)}`),
};

// ─── Default export (all namespaced) ─────────────────────────────────────────
const api = { auth, dashboard, orders, products, categories, branches, staff, inventory, analytics, notifications, customer, pos, reports };
export default api;
