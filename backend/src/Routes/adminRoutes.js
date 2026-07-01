import express from "express";
import verifyAdminToken from "../Middleware/verifyAdminToken.js";
import { authorizePermission, authorizeRole, requireSuperAdmin } from "../Middleware/authorize.js";

// Controllers
import { adminLogin, adminForgotPassword, adminResetPassword, getMe } from "../Controllers/auth/adminAuth.js";
import { getDashboardStats, getRevenueChart, getTopSelling, getLatestOrders, getOrderSources } from "../Controllers/dashboard/dashboardController.js";
import { getOrders, getOrderById, updateOrderStatus, acceptOrder, rejectOrder, logCallAttempt, getCounterPending, getKitchenOrders, createOrder, getOrderHistory } from "../Controllers/orders/ordersController.js";
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct, toggleProductStatus, getPublicMenu } from "../Controllers/products/productsController.js";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../Controllers/categories/categoriesController.js";
import { getBranches, getBranchById, createBranch, updateBranch, deleteBranch, addArea, removeArea, getPublicBranches } from "../Controllers/branches/branchesController.js";
import { getStaff, createStaff, updateStaff, updatePermissions, toggleStaffStatus, deleteStaff, resetStaffPassword } from "../Controllers/staff/staffController.js";
import { getInventory, createInventoryItem, updateInventoryItem, restockItem, deleteInventoryItem } from "../Controllers/inventory/inventoryController.js";
import { getAnalyticsSummary, getRevenueReport } from "../Controllers/analytics/analyticsController.js";
import { getNotifications, markRead, markAllRead } from "../Controllers/notifications/notificationsController.js";
import { getClients, getClientById, createClient, updateClient, updateClientStatus, deleteClient, getSuperAdminStats } from "../Controllers/clients/clientsController.js";
import { getPOSTransactions, syncPOSTransaction, getPOSStatus, updatePOSSettings } from "../Controllers/pos/posController.js";
import { getDailyReport, getMonthlyReport, getCustomerReport } from "../Controllers/reports/reportsController.js";

const router = express.Router();

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post("/api/admin/login",            adminLogin);
router.post("/api/admin/forgot-password",  adminForgotPassword);
router.post("/api/admin/reset-password",   adminResetPassword);
router.get( "/api/admin/me",               verifyAdminToken, getMe);

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get("/api/admin/dashboard/stats",          verifyAdminToken, authorizePermission("analytics.view"), getDashboardStats);
router.get("/api/admin/dashboard/revenue-chart",  verifyAdminToken, authorizePermission("analytics.view"), getRevenueChart);
router.get("/api/admin/dashboard/top-selling",    verifyAdminToken, authorizePermission("analytics.view"), getTopSelling);
router.get("/api/admin/dashboard/latest-orders",  verifyAdminToken, getLatestOrders);
router.get("/api/admin/dashboard/order-sources",  verifyAdminToken, authorizePermission("analytics.view"), getOrderSources);

// ─── Orders ───────────────────────────────────────────────────────────────────
router.get(   "/api/admin/orders",                  verifyAdminToken, authorizePermission("orders.view"),   getOrders);
router.post(  "/api/admin/orders",                  verifyAdminToken, authorizePermission("orders.create"), createOrder);
router.get(   "/api/admin/orders/history",          verifyAdminToken, authorizePermission("orders.view"),   getOrderHistory);
router.get(   "/api/admin/orders/counter/pending",  verifyAdminToken, authorizePermission("counter.view"),  getCounterPending);
router.get(   "/api/admin/orders/kitchen",          verifyAdminToken, authorizePermission("kitchen.view"),  getKitchenOrders);
router.get(   "/api/admin/orders/:id",              verifyAdminToken, authorizePermission("orders.view"),   getOrderById);
router.patch( "/api/admin/orders/:id/status",       verifyAdminToken, authorizePermission("orders.advance"), updateOrderStatus);
router.patch( "/api/admin/orders/:id/accept",       verifyAdminToken, authorizePermission("orders.accept"), acceptOrder);
router.patch( "/api/admin/orders/:id/reject",       verifyAdminToken, authorizePermission("orders.reject"), rejectOrder);
router.patch( "/api/admin/orders/:id/call-attempt", verifyAdminToken, authorizePermission("counter.call_log"), logCallAttempt);

// ─── Products ─────────────────────────────────────────────────────────────────
router.get(   "/api/admin/products",        verifyAdminToken, authorizePermission("products.view"),   getProducts);
router.get(   "/api/admin/products/:id",    verifyAdminToken, authorizePermission("products.view"),   getProductById);
router.post(  "/api/admin/products",        verifyAdminToken, authorizePermission("products.create"), createProduct);
router.put(   "/api/admin/products/:id",    verifyAdminToken, authorizePermission("products.edit"),   updateProduct);
router.delete("/api/admin/products/:id",    verifyAdminToken, authorizePermission("products.delete"), deleteProduct);
router.patch( "/api/admin/products/:id/toggle", verifyAdminToken, authorizePermission("products.toggle"), toggleProductStatus);

// ─── Categories ───────────────────────────────────────────────────────────────
router.get(   "/api/admin/categories",     verifyAdminToken, authorizePermission("categories.view"),   getCategories);
router.post(  "/api/admin/categories",     verifyAdminToken, authorizePermission("categories.create"), createCategory);
router.put(   "/api/admin/categories/:id", verifyAdminToken, authorizePermission("categories.edit"),   updateCategory);
router.delete("/api/admin/categories/:id", verifyAdminToken, authorizePermission("categories.delete"), deleteCategory);

// ─── Branches ─────────────────────────────────────────────────────────────────
router.get(   "/api/admin/branches",              verifyAdminToken, authorizePermission("branches.view"), getBranches);
router.get(   "/api/admin/branches/:id",          verifyAdminToken, authorizePermission("branches.view"), getBranchById);
router.post(  "/api/admin/branches",              verifyAdminToken, authorizeRole("superadmin","client_admin"), createBranch);
router.put(   "/api/admin/branches/:id",          verifyAdminToken, authorizePermission("branches.edit"), updateBranch);
router.delete("/api/admin/branches/:id",          verifyAdminToken, authorizeRole("superadmin","client_admin"), deleteBranch);
router.patch( "/api/admin/branches/:id/areas",    verifyAdminToken, authorizePermission("branches.edit"), addArea);
router.delete("/api/admin/branches/:id/areas",    verifyAdminToken, authorizePermission("branches.edit"), removeArea);

// ─── Staff ────────────────────────────────────────────────────────────────────
router.get(   "/api/admin/staff",                      verifyAdminToken, authorizePermission("staff.view"),   getStaff);
router.post(  "/api/admin/staff",                      verifyAdminToken, authorizePermission("staff.create"), createStaff);
router.put(   "/api/admin/staff/:id",                  verifyAdminToken, authorizePermission("staff.edit"),   updateStaff);
router.patch( "/api/admin/staff/:id/permissions",      verifyAdminToken, authorizePermission("staff.edit"),   updatePermissions);
router.patch( "/api/admin/staff/:id/reset-password",   verifyAdminToken, authorizePermission("staff.edit"),   resetStaffPassword);
router.patch( "/api/admin/staff/:id/toggle-status",    verifyAdminToken, authorizePermission("staff.edit"),   toggleStaffStatus);
router.delete("/api/admin/staff/:id",                  verifyAdminToken, authorizePermission("staff.delete"), deleteStaff);

// ─── Inventory ────────────────────────────────────────────────────────────────
router.get(   "/api/admin/inventory",           verifyAdminToken, authorizePermission("inventory.view"),    getInventory);
router.post(  "/api/admin/inventory",           verifyAdminToken, authorizePermission("inventory.create"),  createInventoryItem);
router.put(   "/api/admin/inventory/:id",       verifyAdminToken, authorizePermission("inventory.edit"),    updateInventoryItem);
router.patch( "/api/admin/inventory/:id/restock", verifyAdminToken, authorizePermission("inventory.restock"), restockItem);
router.delete("/api/admin/inventory/:id",       verifyAdminToken, authorizePermission("inventory.view"),    deleteInventoryItem);

// ─── Analytics & Reports ──────────────────────────────────────────────────────
router.get("/api/admin/analytics/summary", verifyAdminToken, authorizePermission("analytics.view"), getAnalyticsSummary);
router.get("/api/admin/analytics/reports", verifyAdminToken, authorizePermission("reports.view"),   getRevenueReport);

// ─── Notifications ────────────────────────────────────────────────────────────
router.get(  "/api/admin/notifications",             verifyAdminToken, getNotifications);
router.patch("/api/admin/notifications/read-all",    verifyAdminToken, markAllRead);
router.patch("/api/admin/notifications/:id/read",    verifyAdminToken, markRead);

// ─── Superadmin: Clients/Restaurants management ───────────────────────────────
router.get(   "/api/admin/clients",                    verifyAdminToken, requireSuperAdmin, getClients);
router.get(   "/api/admin/clients/stats/overview",     verifyAdminToken, requireSuperAdmin, getSuperAdminStats);
router.get(   "/api/admin/clients/:id",                verifyAdminToken, requireSuperAdmin, getClientById);
router.post(  "/api/admin/clients",                    verifyAdminToken, requireSuperAdmin, createClient);
router.put(   "/api/admin/clients/:id",                verifyAdminToken, requireSuperAdmin, updateClient);
router.patch( "/api/admin/clients/:id/status",         verifyAdminToken, requireSuperAdmin, updateClientStatus);
router.delete("/api/admin/clients/:id",                verifyAdminToken, requireSuperAdmin, deleteClient);

// ─── POS ──────────────────────────────────────────────────────────────────────
router.get(  "/api/admin/pos/transactions",            verifyAdminToken, authorizePermission("pos.view"),     getPOSTransactions);
router.post( "/api/admin/pos/sync",                    verifyAdminToken, authorizePermission("pos.sync"),     syncPOSTransaction);
router.get(  "/api/admin/pos/status/:branchId",        verifyAdminToken, authorizePermission("pos.view"),     getPOSStatus);
router.patch("/api/admin/pos/settings/:branchId",      verifyAdminToken, authorizePermission("pos.settings"), updatePOSSettings);

// ─── Reports ──────────────────────────────────────────────────────────────────
router.get("/api/admin/reports/daily",     verifyAdminToken, authorizePermission("reports.view"), getDailyReport);
router.get("/api/admin/reports/monthly",   verifyAdminToken, authorizePermission("reports.view"), getMonthlyReport);
router.get("/api/admin/reports/customers", verifyAdminToken, authorizePermission("reports.view"), getCustomerReport);

// ─── Public endpoints (no auth) ───────────────────────────────────────────────
router.get("/api/menu",     getPublicMenu);        // GET /api/menu?branchId=xxx
router.get("/api/branches", getPublicBranches);    // GET /api/branches?restaurantId=xxx&city=Karachi

export default router;
