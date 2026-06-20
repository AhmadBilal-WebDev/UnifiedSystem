# Restaurant System — Fully Connected

One backend, one frontend. Customer website and admin dashboard run on the
same domain and share the exact same MongoDB collections, so anything you
add/edit/delete in the dashboard appears instantly on the live website.

## Structure
```
UnifiedSystem/
├── backend/    → Port 5000 (single backend for everything)
├── frontend/   → Port 5173 (customer site + /admin dashboard merged)
├── setup.mjs   → Run once — creates restaurant, branch, admin login, sample data
└── start-all.bat
```

## First-time setup
```
node setup.mjs
```
This creates:
- A restaurant + branch
- An admin login for the dashboard
- One sample category + product (so you immediately see it live on the site)

## Start everything
Double-click `start-all.bat` (installs dependencies automatically on first run).

## URLs
| Page              | URL                                |
|-------------------|-------------------------------------|
| Customer Website  | http://localhost:5173               |
| Admin Dashboard   | http://localhost:5173/admin         |
| Backend API       | http://localhost:5000               |

## Admin Login
```
Email   : admin@delightcrust.com
Password: Admin@123
```

## If admin login says "account does not exist"
Run this — it diagnoses and fixes the most common causes (MongoDB not
running, setup.mjs never run, password mismatch) and prints exactly
what it finds at each step:
```
node fix-admin-login.mjs
```

## What's unified (single source of truth)
- **Category / Product / Order / Customer / Branch / Restaurant** models are
  shared — the dashboard's `/api/admin/*` routes and the website's
  `/login`, `/signup`, `/create`, `/user/menu`, `/user/branches` routes all
  read and write the same MongoDB collections.
- Adding a product with an image in the dashboard makes it appear on the
  website menu immediately — same for categories, banners, and order status
  updates.
- Customer signups from the website show up in the dashboard's customer/user
  data, since both use the same `Customer` collection.

## Product/Category attributes (Sizes, Addons, Extras)
Open a product in the dashboard → you'll see editors for Sizes, Addons, and
Extras (each is a list of name + price). These map directly to the
customer website's product modal (size selector, addons, extras) — no
extra setup needed, just fill them in and save.

## Show on All Branches
If your account manages more than one branch, both the Product and Category
forms show a "Show on all branches" toggle. Turning it on makes that item
visible on every branch instead of just the one you're currently managing
(stored internally as `branchId: null`).

## Dark / Light Mode
Toggle from the Topbar or Settings page inside the dashboard. This only
affects the `/admin` dashboard — the customer website's own styling is
completely separate and unaffected by this toggle.

## No demo/mock data — everything is real
Dashboard, Analytics, Reports, and POS Integration now pull 100% live data
from MongoDB via the backend's real aggregation endpoints — no hardcoded
numbers anywhere:
- **Dashboard** — stats, revenue chart, and branch performance matrix are
  computed live (`/api/admin/dashboard/stats`, `/revenue-chart`).
- **Analytics** — revenue trend chart now calls the same real endpoint;
  branch comparison, source mix, hourly pattern, and top products were
  already computed from real orders.
- **Reports** — KPIs and branch breakdown are computed from real orders;
  "Generate Report" now exports an actual CSV file built from that real
  data (no fake PDF/Excel — that capability doesn't exist on the backend).
  The fake "Saved Reports" history was removed since there's no backend
  storage for it yet.
- **POS Integration** — transactions list, sync, and refresh buttons are
  wired to the real `/api/admin/pos/*` endpoints. The webhook URL/API
  key section is still placeholder UI (no real webhook system exists
  in this backend).

## Customer signup attribution fix
Website signups now correctly set `restaurantId`/`parentBranchId` (looked
up from the customer's city) — without this, the dashboard's customer
counts would always show 0 even with real signups.


## Image uploads
- Product images   → `frontend/public/images/products/`
- Category banners → `frontend/public/images/categories/`
- Served at `http://localhost:5000/images/...`
