/**
 * AppContext.jsx — Dynamic version connected to real MongoDB backend.
 *
 * Drop-in replacement for the static mockData version.
 * Place at: src/contexts/AppContext.jsx
 *
 * Required:  src/services/api.js  (copy frontend-integration/api.js → src/services/api.js)
 * Required:  VITE_API_URL=http://localhost:5000/api  in .env
 */

import React, {
  createContext, useContext, useState,
  useCallback, useEffect, useRef,
} from "react";
import api, { setToken, clearToken, getToken } from "../services/api.js";
import { ROLES, PERMISSIONS, CONFIRM_STATUS } from "../data/mockData.js"; // keep enums/labels

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // ── Auth state ──────────────────────────────────────────────────────────
  const [currentUser,   setCurrentUser  ] = useState(null);
  const [authLoading,   setAuthLoading  ] = useState(true);  // restoring session

  // ── Data state ──────────────────────────────────────────────────────────
  const [branchList,    setBranchList   ] = useState([]);
  const [productList,   setProductList  ] = useState([]);
  const [orderList,     setOrderList    ] = useState([]);
  const [userList,      setUserList     ] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [notifList,     setNotifList    ] = useState([]);
  const [categoryList,  setCategoryList ] = useState([]);
  const [dashStats,     setDashStats    ] = useState(null);

  // ── UI state ────────────────────────────────────────────────────────────
  const [toasts,           setToasts         ] = useState([]);
  const [activeBranchId,   setActiveBranchId ] = useState(null);
  const [activeClientId,   setActiveClientId ] = useState(null);
  const [activeNav,        setActiveNav      ] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme,            setTheme          ] = useState(
    () => localStorage.getItem("ros-theme") || "dark"
  );
  const [highlightOrderId, setHighlightOrderId] = useState(null);
  const [loading,          setLoading        ] = useState({});

  // Polling ref
  const pollRef = useRef(null);

  // ── Theme ────────────────────────────────────────────────────────────────
  // NOTE: data-theme is applied directly on the .dashboard-shell element in
  // DashboardApp.jsx (via the `theme` value below), NOT on document.documentElement.
  // Setting it on <html> would (a) never match dashboard.css's scoped
  // `.dashboard-shell[data-theme=...]` selectors, and (b) leak the dashboard's
  // theme attribute onto the customer website's <html> element globally.
  useEffect(() => {
    localStorage.setItem("ros-theme", theme);
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme(t => t === "dark" ? "light" : "dark"), []);

  // ── Toasts ────────────────────────────────────────────────────────────────
  const addToast = useCallback((message, type = "info", duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);
  const removeToast = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const setLoad = (key, val) => setLoading(prev => ({ ...prev, [key]: val }));

  // Map backend user object (role strings differ slightly) to frontend ROLES
  const mapRole = (backendRole) => {
    const map = {
      superadmin:     ROLES.SUPER_ADMIN,
      client_admin:   ROLES.CLIENT_ADMIN,
      branch_manager: ROLES.BRANCH_MANAGER,
      counter:        ROLES.COUNTER,
      editor:         ROLES.EDITOR,
      viewer:         ROLES.VIEWER,
      kitchen:        ROLES.KITCHEN,
    };
    return map[backendRole] || backendRole;
  };

  // ── Restore session on mount ─────────────────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      const token = getToken();
      if (!token) { setAuthLoading(false); return; }
      try {
        const { data } = await api.auth.getMe();
        applyLogin(data);
      } catch (e) {
        clearToken();
      } finally {
        setAuthLoading(false);
      }
    };
    restore();
  }, []);

  // ── Load data whenever user/branch changes ───────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    loadAll();
    // Poll notifications every 30s
    pollRef.current = setInterval(fetchNotifications, 30000);
    return () => clearInterval(pollRef.current);
  }, [currentUser, activeBranchId]);

  const loadAll = async () => {
    await Promise.allSettled([
      fetchBranches(),
      fetchOrders(),
      fetchProducts(),
      fetchCategories(),
      fetchInventory(),
      fetchNotifications(),
      fetchStaff(),
      fetchPOSTransactions(),
    ]);
  };

  // ── Apply login ───────────────────────────────────────────────────────────
  const applyLogin = (userData) => {
    const frontendUser = {
      id:           userData.id || userData._id,
      name:         userData.name,
      email:        userData.email,
      role:         mapRole(userData.role),
      accountType:  userData.accountType,
      restaurantId: userData.restaurantId?._id || userData.restaurantId,
      branchId:     userData.branchId,
      branchIds:    userData.branchIds || [],
      permissions:  userData.permissions || [],
      avatar:       userData.avatar || userData.name?.slice(0,2).toUpperCase(),
      color:        userData.color || "#6366f1",
    };
    setCurrentUser(frontendUser);
    setActiveClientId(frontendUser.restaurantId || null);
    if (frontendUser.branchId) setActiveBranchId(frontendUser.branchId);
    setActiveNav(
      frontendUser.role === ROLES.COUNTER ? "counter" :
      frontendUser.role === ROLES.KITCHEN ? "kitchen" : "dashboard"
    );
  };

  // ── Auth ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoad("login", true);
    try {
      const res = await api.auth.login(email, password);
      setToken(res.token);
      applyLogin(res.user);
      addToast(`Welcome back, ${res.user.name}!`, "success");
      return { success: true };
    } catch (err) {
      addToast(err.message || "Login failed.", "error");
      return { success: false, message: err.message };
    } finally {
      setLoad("login", false);
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setCurrentUser(null);
    setActiveBranchId(null);
    setActiveNav("dashboard");
    setBranchList([]);
    setProductList([]);
    setOrderList([]);
    setUserList([]);
    setInventoryList([]);
    setNotifList([]);
    setCategoryList([]);
    clearInterval(pollRef.current);
  }, []);

  // ── Permission check ──────────────────────────────────────────────────────
  const hasPermission = useCallback((action) => {
    if (!currentUser) return false;
    const role = currentUser.role;
    if (role === ROLES.SUPER_ADMIN || role === "superadmin") return true;
    if (role === ROLES.CLIENT_ADMIN || role === "client_admin") return true;

    const p = PERMISSIONS[role];
    if (!p) return false;
    if (p.pages?.includes("*") || p.actions?.includes("*")) return true;
    if (p.pages?.includes(action)) return true;
    if (p.actions?.includes(action)) return true;

    // Also check granular backend permissions
    if (currentUser.permissions?.includes(action)) return true;
    return false;
  }, [currentUser]);

  // ── Branches ─────────────────────────────────────────────────────────────
  const fetchBranches = async () => {
    try {
      const res = await api.branches.getAll();
      // Map _id → id for frontend compatibility
      setBranchList((res.data || []).map(b => ({ ...b, id: b._id || b.id })));
    } catch (e) { console.warn("fetchBranches:", e.message); }
  };

  const updateBranch = useCallback(async (id, updates) => {
    try {
      const res = await api.branches.update(id, updates);
      setBranchList(prev => prev.map(b => b.id === id || b._id === id ? { ...b, ...res.data, id: res.data._id || id } : b));
      addToast("Branch updated!", "success");
    } catch (e) { addToast(e.message, "error"); }
  }, [addToast]);

  const addBranch = useCallback(async (data) => {
    try {
      const res = await api.branches.create(data);
      setBranchList(prev => [...prev, { ...res.data, id: res.data._id }]);
      addToast("Branch created!", "success");
      return res.data;
    } catch (e) { addToast(e.message, "error"); }
  }, [addToast]);

  // ── Orders ────────────────────────────────────────────────────────────────
  const fetchOrders = async () => {
    if (!currentUser) return;
    try {
      const params = activeBranchId ? { branchId: activeBranchId, limit: 100 } : { limit: 100 };
      const res = await api.orders.getAll(params);
      setOrderList((res.data || []).map(o => ({ ...o, id: o._id || o.id })));
    } catch (e) { console.warn("fetchOrders:", e.message); }
  };

  const updateOrderStatus = useCallback(async (id, status) => {
    try {
      const res = await api.orders.updateStatus(id, status);
      setOrderList(prev => prev.map(o => (o.id === id || o._id === id) ? { ...res.data, id: res.data._id } : o));
    } catch (e) { addToast(e.message, "error"); }
  }, [addToast]);

  const acceptOrder = useCallback(async (id) => {
    try {
      const res = await api.orders.accept(id);
      setOrderList(prev => prev.map(o => (o.id === id || o._id === id) ? { ...res.data, id: res.data._id } : o));
      addToast(`Order accepted ✓`, "success");
    } catch (e) { addToast(e.message, "error"); }
  }, [addToast]);

  const rejectOrder = useCallback(async (id, reason = "") => {
    try {
      const res = await api.orders.reject(id, reason);
      setOrderList(prev => prev.map(o => (o.id === id || o._id === id) ? { ...res.data, id: res.data._id } : o));
      addToast("Order rejected", "warning");
    } catch (e) { addToast(e.message, "error"); }
  }, [addToast]);

  const incrementCallAttempt = useCallback(async (id) => {
    try {
      const res = await api.orders.logCallAttempt(id);
      setOrderList(prev => prev.map(o => (o.id === id || o._id === id) ? { ...res.data, id: res.data._id } : o));
      addToast("Call attempt logged", "info");
    } catch (e) { addToast(e.message, "error"); }
  }, [addToast]);

  const addOrder = useCallback(async (data) => {
    try {
      const res = await api.orders.create(data);
      const newOrder = { ...res.data, id: res.data._id };
      setOrderList(prev => [newOrder, ...prev]);
      addToast("New order added!", "success", 4000);
      return newOrder;
    } catch (e) {
      addToast(e.message, "error");
      throw e;
    }
  }, [addToast]);

  // ── Products ──────────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    if (!currentUser) return;
    try {
      const params = activeBranchId ? { branchId: activeBranchId } : {};
      const res = await api.products.getAll(params);
      setProductList((res.data || []).map(p => ({ ...p, id: p._id || p.id, categoryId: p.categoryId?._id || p.categoryId })));
    } catch (e) { console.warn("fetchProducts:", e.message); }
  };

  const addProduct = useCallback(async (data) => {
    try {
      const res = await api.products.create(data);
      const p = { ...res.data, id: res.data._id };
      setProductList(prev => [...prev, p]);
      addToast(`"${data.name}" added!`, "success");
      return p;
    } catch (e) { addToast(e.message, "error"); throw e; }
  }, [addToast]);

  const updateProduct = useCallback(async (id, updates) => {
    try {
      const res = await api.products.update(id, updates);
      setProductList(prev => prev.map(p => (p.id === id || p._id === id) ? { ...res.data, id: res.data._id } : p));
      addToast("Product updated!", "success");
    } catch (e) { addToast(e.message, "error"); }
  }, [addToast]);

  const deleteProduct = useCallback(async (id) => {
    try {
      await api.products.delete(id);
      setProductList(prev => prev.filter(p => p.id !== id && p._id !== id));
      addToast("Product deleted", "info");
    } catch (e) { addToast(e.message, "error"); }
  }, [addToast]);

  const toggleProductStatus = useCallback(async (id) => {
    try {
      const res = await api.products.toggle(id);
      setProductList(prev => prev.map(p => (p.id === id || p._id === id) ? { ...res.data, id: res.data._id } : p));
    } catch (e) { addToast(e.message, "error"); }
  }, [addToast]);

  // ── Categories ────────────────────────────────────────────────────────────
  const fetchCategories = async () => {
    if (!currentUser) return;
    try {
      const params = activeBranchId ? { branchId: activeBranchId } : {};
      const res = await api.categories.getAll(params);
      setCategoryList((res.data || []).map(c => ({ ...c, id: c._id || c.id })));
    } catch (e) { console.warn("fetchCategories:", e.message); }
  };

  const addCategory = useCallback(async (data) => {
    try {
      const res = await api.categories.create(data);
      const c = { ...res.data, id: res.data._id };
      setCategoryList(prev => [...prev, c]);
      addToast("Category added!", "success");
      return c;
    } catch (e) { addToast(e.message, "error"); throw e; }
  }, [addToast]);

  const updateCategory = useCallback(async (id, updates) => {
    try {
      const res = await api.categories.update(id, updates);
      setCategoryList(prev => prev.map(c => (c.id === id || c._id === id) ? { ...res.data, id: res.data._id } : c));
      addToast("Category updated!", "success");
    } catch (e) { addToast(e.message, "error"); }
  }, [addToast]);

  const deleteCategory = useCallback(async (id) => {
    try {
      await api.categories.delete(id);
      setCategoryList(prev => prev.filter(c => c.id !== id && c._id !== id));
      addToast("Category deleted", "info");
    } catch (e) { addToast(e.message, "error"); }
  }, [addToast]);

  // ── Staff ─────────────────────────────────────────────────────────────────
  const fetchStaff = async () => {
    if (!currentUser) return;
    try {
      const res = await api.staff.getAll();
      setUserList((res.data || []).map(u => ({ ...u, id: u._id || u.id })));
    } catch (e) { console.warn("fetchStaff:", e.message); }
  };

  const addStaff = useCallback(async (data) => {
    try {
      const res = await api.staff.create(data);
      const u = { ...res.data, id: res.data._id };
      setUserList(prev => [...prev, u]);
      addToast(`${data.name} invited!`, "success");
      return u;
    } catch (e) { addToast(e.message, "error"); throw e; }
  }, [addToast]);

  const updateStaff = useCallback(async (id, updates) => {
    try {
      const res = await api.staff.update(id, updates);
      setUserList(prev => prev.map(u => (u.id === id || u._id === id) ? { ...res.data, id: res.data._id } : u));
      addToast("Staff updated!", "success");
    } catch (e) { addToast(e.message, "error"); }
  }, [addToast]);

  const removeStaff = useCallback(async (id) => {
    try {
      await api.staff.delete(id);
      setUserList(prev => prev.filter(u => u.id !== id && u._id !== id));
      addToast("Staff removed", "info");
    } catch (e) { addToast(e.message, "error"); }
  }, [addToast]);

  // ── Inventory ─────────────────────────────────────────────────────────────
  const fetchInventory = async () => {
    if (!currentUser) return;
    try {
      const params = activeBranchId ? { branchId: activeBranchId } : {};
      const res = await api.inventory.getAll(params);
      setInventoryList((res.data || []).map(i => ({ ...i, id: i._id || i.id })));
    } catch (e) { console.warn("fetchInventory:", e.message); }
  };

  const addInventory = useCallback(async (data) => {
    try {
      const res = await api.inventory.create(data);
      const item = { ...res.data, id: res.data._id };
      setInventoryList(prev => [...prev, item]);
      addToast("Item added!", "success");
      return item;
    } catch (e) { addToast(e.message, "error"); throw e; }
  }, [addToast]);

  const updateInventory = useCallback(async (id, updates) => {
    try {
      const res = await api.inventory.update(id, updates);
      setInventoryList(prev => prev.map(i => (i.id === id || i._id === id) ? { ...res.data, id: res.data._id } : i));
      addToast("Inventory updated!", "success");
    } catch (e) { addToast(e.message, "error"); }
  }, [addToast]);

  // ── Notifications ─────────────────────────────────────────────────────────
  const fetchNotifications = async () => {
    if (!currentUser) return;
    try {
      const res = await api.notifications.getAll();
      setNotifList((res.data || []).map(n => ({ ...n, id: n._id || n.id, time: new Date(n.createdAt || n.time) })));
    } catch (e) { /* silent */ }
  };

  const markNotifRead = useCallback(async (id) => {
    try {
      await api.notifications.markRead(id);
      setNotifList(prev => prev.map(n => (n.id === id || n._id === id) ? { ...n, read: true } : n));
    } catch (e) { /* silent */ }
  }, []);

  const markAllNotifRead = useCallback(async () => {
    try {
      await api.notifications.markAllRead();
      setNotifList(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) { /* silent */ }
  }, []);

  const handleNotifClick = useCallback((notif) => {
    markNotifRead(notif.id);
    if (!notif.navTarget) return;
    if (notif.branchId) setActiveBranchId(notif.branchId);
    if (notif.navParam && notif.navTarget === "orders") {
      setHighlightOrderId(notif.navParam);
      setTimeout(() => setHighlightOrderId(null), 5000);
    }
    setActiveNav(notif.navTarget);
  }, [markNotifRead]);

  const unreadNotifCount = notifList.filter(n => !n.read).length;

  // ── Selectors ─────────────────────────────────────────────────────────────
  const getClientProducts = useCallback((cid) =>
    productList.filter(p => p.restaurantId === (cid || activeClientId) || p.clientId === (cid || activeClientId)),
    [productList, activeClientId]);

  const getClientBranches = useCallback((cid) =>
    branchList.filter(b => b.restaurantId === (cid || activeClientId) || b.clientId === (cid || activeClientId)),
    [branchList, activeClientId]);

  const getAccessibleBranches = useCallback(() => {
    if (!currentUser) return [];
    if (currentUser.role === ROLES.SUPER_ADMIN || currentUser.role === "superadmin") return branchList;
    if (currentUser.role === ROLES.CLIENT_ADMIN || currentUser.role === "client_admin")
      return branchList.filter(b => b.restaurantId === currentUser.restaurantId || b.clientId === currentUser.restaurantId);
    return branchList.filter(b =>
      (currentUser.branchIds || []).includes(b.id) ||
      (currentUser.branchIds || []).includes(b._id)
    );
  }, [currentUser, branchList]);

  const getFilteredOrders = useCallback((extraBranchId) => {
    const bid = extraBranchId || activeBranchId;
    return orderList.filter(o => {
      if (bid) return (o.branchId === bid || o.branchId?._id === bid || o.branchId?.toString() === bid);
      return true;
    });
  }, [orderList, activeBranchId]);

  const getPendingConfirmOrders = useCallback(() =>
    getFilteredOrders().filter(o =>
      [CONFIRM_STATUS.PENDING_CALL, CONFIRM_STATUS.CALL_DONE, CONFIRM_STATUS.NO_ANSWER].includes(o.confirmStatus) &&
      o.status !== "cancelled"
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [getFilteredOrders]);

  // ── POS ──────────────────────────────────────────────────────────────────
  const [posTransactions, setPosTransactions] = useState([]);

  const fetchPOSTransactions = useCallback(async (branchId) => {
    if (!currentUser) return;
    try {
      const res = await api.pos.getTransactions(branchId ? { branchId } : {});
      setPosTransactions((res.data || []).map(t => ({ ...t, id: t._id || t.id })));
    } catch (e) { console.warn("fetchPOSTransactions:", e.message); }
  }, [currentUser]);

  // POS sync — creates a real order via the same endpoint as syncPOSOrder below
  const syncPOSOrder = useCallback(async (branchId, txn) => {
    return addOrder({
      branchId,
      customerName:  txn.customerName || "Walk-in Customer",
      customerPhone: txn.customerPhone || "",
      items:         txn.items,
      subtotal:      txn.subtotal,
      tax:           txn.tax,
      discount:      0,
      deliveryFee:   0,
      total:         txn.total,
      source:        "pos",
      type:          "dine-in",
      paymentMethod: txn.paymentMethod || "pos_cash",
      tableNo:       txn.tableNo || null,
      posSync:       true,
    });
  }, [addOrder]);

  // ── Context value ──────────────────────────────────────────────────────────
  const value = {
    // Auth
    currentUser, login, logout, hasPermission, authLoading, loading,

    // Data
    branchList, productList, orderList, userList, inventoryList,
    notifList, categoryList, dashStats,

    // Refresh methods
    fetchBranches, fetchOrders, fetchProducts, fetchCategories,
    fetchInventory, fetchNotifications, fetchStaff, loadAll,

    // UI
    activeBranchId, setActiveBranchId,
    activeClientId, setActiveClientId,
    activeNav, setActiveNav,
    sidebarCollapsed, setSidebarCollapsed,
    theme, toggleTheme,
    toasts, addToast, removeToast,
    highlightOrderId, setHighlightOrderId,

    // Notifications
    handleNotifClick, markNotifRead, markAllNotifRead, unreadNotifCount,

    // Orders
    updateOrderStatus, acceptOrder, rejectOrder, incrementCallAttempt, addOrder,
    syncPOSOrder,
    getPendingConfirmOrders, getFilteredOrders,

    // Products
    addProduct, updateProduct, deleteProduct, toggleProductStatus,

    // Categories
    addCategory, updateCategory, deleteCategory,

    // Branches
    updateBranch, addBranch,

    // Staff
    addStaff, updateStaff, removeStaff,

    // Inventory
    updateInventory, addInventory,

    // Selectors
    getClientProducts, getClientBranches, getAccessibleBranches,

    // Clients stub (for super admin pages — fetch separately if needed)
    clients: [],
    posTransList: posTransactions,
    getPOSTransactions: (branchId) => branchId ? posTransactions.filter(t => (t.branchId === branchId || t.branchId?._id === branchId || t.branchId?.toString() === branchId)) : posTransactions,
    fetchPOSTransactions,
    getRoleActions: (role) => {
      const p = PERMISSIONS[role];
      if (!p) return [];
      if (p.actions?.includes("*")) return ["*"];
      return p.actions || [];
    },
    getRolePages: (role) => {
      const p = PERMISSIONS[role];
      if (!p) return [];
      if (p.pages?.includes("*")) return ["*"];
      return p.pages || [];
    },
    getMyActions: () => {
      if (!currentUser) return [];
      const p = PERMISSIONS[currentUser.role];
      if (!p) return currentUser.permissions || [];
      if (p.actions?.includes("*")) return ["*"];
      return [...(p.actions || []), ...(currentUser.permissions || [])];
    },
  };

  if (authLoading) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", background:"#0f0f0f", color:"#fff", fontSize:"1rem" }}>
        Loading RestaurantOS...
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
