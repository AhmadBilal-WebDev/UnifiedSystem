import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  AlertTriangle,
  Loader2,
  ShoppingBag,
  Layers,
  Utensils,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

import { getApiBase } from "../../../lib/apiBase.js";
const backendApi = getApiBase();

export default function MenuView({ selectedBranchId }) {
  const [expandedCategory, setExpandedCategory] = useState(null);
  const adminUser = JSON.parse(localStorage.getItem("adminUser")) || {};
  const userRole = adminUser.role || "viewer";
  const userPermissions = adminUser.permissions || [];
  const canEditMenu =
    userPermissions.includes("editMenu") ||
    ["superadmin", "owner", "admin", "manager", "editor"].includes(userRole);
  const canEditSelectedBranch = canEditMenu;
  const [expandedItem, setExpandedItem] = useState(null);

  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);

  const [categories, setCategories] = useState([]);
const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [deletePopup, setDeletePopup] = useState({
    isOpen: false,
    type: null,
    catId: null,
    itemId: null,
  });

  const [catForm, setCatForm] = useState({ name: "", desc: "", bannerImg: "" });

  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [itemForm, setItemForm] = useState({
    name: "",
    price: "",
    subCategory: "",
    desc: "",
    img: "",
    sizes: [],
    addons: [],
    extras: [],
  });

  const [newSize, setNewSize] = useState({ name: "", price: "" });
  const [newAddon, setNewAddon] = useState({ name: "", price: "" });
  const [newExtra, setNewExtra] = useState({ name: "", price: "" });

  // Calculate stats for Dashboard Metrics
  const totalCategories = categories.length;
  const totalItems = categories.reduce((acc, cat) => acc + (cat.items?.length || 0), 0);
  const avgPrice = totalItems > 0 
    ? Math.round(categories.reduce((acc, cat) => acc + (cat.items?.reduce((sum, item) => sum + Number(item.price || 0), 0) || 0), 0) / totalItems)
    : 0;

  const getAuthHeaders = () => {
    const token = localStorage.getItem("adminToken");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("adminToken");

      if (!token) {
        throw new Error("Log in nahi hain aap. Token missing hai.");
      }

      const query = selectedBranchId
        ? `?branchId=${encodeURIComponent(selectedBranchId)}`
        : "";
      const response = await fetch(`${backendApi}/admin/my-products${query}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          throw new Error("Session expire ho gaya hai, dobara login karein.");
        }
        throw new Error("Server se data fetch nahi ho saka");
      }

      const data = await response.json();
      console.log("Backend Response Data:", data);

      if (data && Array.isArray(data.products)) {
        setCategories(data.products);
      } else if (Array.isArray(data)) {
        setCategories(data);
      } else if (data && Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else if (data && Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        throw new Error("Backend se sahi format (Array) mein data nahi mila.");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedBranchId]);

  const openCatModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({ name: cat.name, desc: cat.desc, bannerImg: cat.bannerImg });
    } else {
      setEditingCat(null);
      setCatForm({ name: "", desc: "", bannerImg: "" });
    }
    setShowCatModal(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();

    if (!catForm.name.trim()) {
      alert("Category Name is required!");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const payload = {
        name: catForm.name,
        desc: catForm.desc || "",
        bannerImg: catForm.bannerImg || "",
        frontendUrl: window.location.origin,
      };

      if (!editingCat && selectedBranchId) {
        payload.branchId = selectedBranchId;
      }

      let response;
      if (editingCat) {
        response = await axios.put(
          `${backendApi}/admin/menu/categories/${editingCat.id}`,
          payload,
          { headers: getAuthHeaders() },
        );
      } else {
        response = await axios.post(
          `${backendApi}/admin/category/create`,
          payload,
          { headers: getAuthHeaders() },
        );
      }

      if (response.data.success) {
        alert(
          editingCat
            ? "Category updated successfully!"
            : "Category created successfully!",
        );
        fetchProducts();
        if (selectedBranchId) {
          localStorage.setItem("adminSelectedBranchId", selectedBranchId);
        }
        setCatForm({ name: "", desc: "", bannerImg: "" });
        setEditingCat(null);
        setShowCatModal(false);
      }
    } catch (error) {
      console.error("Category Save Error:", error);
      alert(error.response?.data?.message || "Failed to save category");
    }
  };

  const confirmDeleteCategory = async () => {
    try {
      const response = await axios.delete(
        `${backendApi}/admin/menu/categories/${deletePopup.catId}`,
        { headers: getAuthHeaders() },
      );

      if (response.data.success) {
        alert("Category dropped successfully");
        fetchProducts();
      }
    } catch (error) {
      console.error("Category Delete Error:", error);
      alert(error.response?.data?.message || "Failed to delete category");
    } finally {
      setDeletePopup({ isOpen: false, type: null, catId: null, itemId: null });
    }
  };

  const openItemModal = (catId, item = null) => {
    setSelectedCatId(catId);
    if (item) {
      setEditingItem(item);
      setItemForm({ ...item });
    } else {
      setEditingItem(null);
      setItemForm({
        name: "",
        price: "",
        subCategory: "",
        desc: "",
        img: "",
        sizes: [],
        addons: [],
        extras: [],
      });
    }
    setShowItemModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();

    if (!itemForm.name.trim() || !itemForm.price) {
      alert("Item Name and Base Price are required properties!");
      return;
    }

    try {
      const payload = {
        name: itemForm.name,
        price: itemForm.price,
        subCategory: itemForm.subCategory || "",
        desc: itemForm.desc || "",
        img: itemForm.img || "",
        sizes: itemForm.sizes,
        addons: itemForm.addons,
        extras: itemForm.extras,
      };

      if (!editingItem && selectedBranchId) {
        payload.branchId = selectedBranchId;
      }

      let response;
      if (editingItem) {
        response = await axios.put(
          `${backendApi}/admin/menu/items/${editingItem.id}`,
          payload,
          { headers: getAuthHeaders() },
        );
      } else {
        response = await axios.post(
          `${backendApi}/admin/item-add/${selectedCatId}`,
          payload,
          { headers: getAuthHeaders() },
        );
      }

      if (response.data.success) {
        alert(response.data.message || "Item processed successfully!");
        fetchProducts();
        if (selectedBranchId) {
          localStorage.setItem("adminSelectedBranchId", selectedBranchId);
        }
        setItemForm({
          name: "",
          price: "",
          subCategory: "",
          desc: "",
          img: "",
          sizes: [],
          addons: [],
          extras: [],
        });
        setEditingItem(null);
        setShowItemModal(false);
      }
    } catch (error) {
      console.error("Item Save Error:", error);
      alert(
        error.response?.data?.message || "Failed to process item operations.",
      );
    }
  };

  const confirmDeleteItem = async () => {
    try {
      const response = await axios.delete(
        `${backendApi}/admin/menu/items/${deletePopup.itemId}`,
        { headers: getAuthHeaders() },
      );

      if (response.data.success) {
        alert("Item deleted successfully");
        fetchProducts();
      }
    } catch (error) {
      console.error("Item Delete Error:", error);
      alert(error.response?.data?.message || "Failed to drop targeted item.");
    } finally {
      setDeletePopup({ isOpen: false, type: null, catId: null, itemId: null });
    }
  };

   if (isLoading)
    return (
      <div className="fixed inset-0 flex flex-col gap-4 justify-center items-center bg-[#0b0f19] z-[9999]">
        <div className="relative">
          <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-blue-500 text-[10px] font-medium tracking-[0.2em] animate-pulse">
            PLEASE WAIT...
          </span>
        </div>
      </div>
    );

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-[#0b0f19] min-h-screen font-sans text-slate-200">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 bg-[#131b2e] p-6 rounded-2xl border border-slate-800"
        >
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="bg-indigo-600/20 p-3.5 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-lg"
            >
              <ShoppingBag size={26} />
            </motion.div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide">
                Menu Intelligence Dashboard
              </h2>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-0.5">
                Control panel & distribution breakdown
              </p>
              {!canEditSelectedBranch && canEditMenu && selectedBranchId && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-amber-500 font-medium mt-1"
                >
                  ⚠️ Viewing external branch. Operations are locked.
                </motion.p>
              )}
            </div>
          </div>

          {canEditMenu ? (
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: "0 4px 20px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.97 }}
              onClick={() => openCatModal()}
              title="Create a completely new menu category"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all text-sm border border-blue-400/20 shadow-lg cursor-pointer"
            >
              <Plus size={18} />
              Add Category
            </motion.button>
          ) : (
            <div className="text-xs text-slate-500 bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800">
              Read-Only Access Mode
            </div>
          )}
        </motion.div>

        {/* ANALYTICS METRIC CARDS */}
        {!error && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-[#131b2e] p-5 rounded-2xl border border-slate-800 flex items-center justify-between shadow-md relative overflow-hidden group">
              <div className="absolute inset-y-0 left-0 w-1.5 bg-blue-500"></div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Categories</p>
                <h3 className="text-2xl font-black text-white mt-1">{totalCategories}</h3>
              </div>
              <Layers className="text-blue-500/20 group-hover:text-blue-500/40 transition-colors" size={42} />
            </div>

            <div className="bg-[#131b2e] p-5 rounded-2xl border border-slate-800 flex items-center justify-between shadow-md relative overflow-hidden group">
              <div className="absolute inset-y-0 left-0 w-1.5 bg-emerald-500"></div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Items</p>
                <h3 className="text-2xl font-black text-white mt-1">{totalItems}</h3>
              </div>
              <Utensils className="text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors" size={42} />
            </div>

            <div className="bg-[#131b2e] p-5 rounded-2xl border border-slate-800 flex items-center justify-between shadow-md relative overflow-hidden group">
              <div className="absolute inset-y-0 left-0 w-1.5 bg-indigo-500"></div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Avg Base Price</p>
                <h3 className="text-2xl font-black text-white mt-1">Rs. {avgPrice}</h3>
              </div>
              <DollarSign className="text-indigo-500/20 group-hover:text-indigo-500/40 transition-colors" size={42} />
            </div>
          </motion.div>
        )}

        {/* ERROR HANDLER */}
        {error && !isLoading && (
          <div className="bg-red-950/40 border border-red-900 text-red-400 p-4 rounded-2xl flex items-center gap-3 mb-6">
            <AlertTriangle size={20} />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* EMPTY STATE */}
        {!isLoading && !error && categories.length === 0 && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#131b2e] rounded-2xl border border-slate-800 p-12 text-center shadow-lg max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Plus size={28} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Ecosystem Active</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
              There are currently no products or structural categories logged inside this branch module.
            </p>
            <button
              onClick={() => openCatModal()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Initialize First Category
            </button>
          </motion.div>
        )}

        {/* CATEGORIES WRAPPER */}
        {!isLoading && !error && (
          <div className="space-y-5">
            <AnimatePresence>
              {categories.map((category, index) => {
                const isCatOpen = expandedCategory === category.id;
                const categoryItems = category.items || [];
                
                // Calculate mini graph percentage share
                const itemPercentage = totalItems > 0 ? Math.round((categoryItems.length / totalItems) * 100) : 0;

                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[#131b2e] rounded-2xl border border-slate-800 shadow-xl overflow-hidden group hover:border-slate-700 transition-colors"
                  >
                    {/* Category Block Line */}
                    <div className="p-4 sm:p-5 flex flex-col lg:grid lg:grid-cols-12 lg:items-center items-start justify-between gap-4">
                      
                      <div className="flex items-center gap-4 w-full lg:col-span-6">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-900 rounded-xl p-1.5 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                          <img
                            src={category.bannerImg || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150"}
                            alt="category banner"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                            {category.name}
                          </h2>
                          <p className="text-slate-400 text-xs line-clamp-1 max-w-md">
                            {category.desc || "No custom description cataloged."}
                          </p>
                          <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-bold px-2.5 py-0.5 rounded-md mt-1">
                            {categoryItems.length} Products Installed
                          </span>
                        </div>
                      </div>

                      {/* MICRO-GRAPH BAR (Dashboard Feature) */}
                      <div className="hidden sm:flex flex-col w-full lg:col-span-3 px-4">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
                          <span className="flex items-center gap-1"><TrendingUp size={12}/> Volume Share</span>
                          <span>{itemPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800/50">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${itemPercentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
                          />
                        </div>
                      </div>

                      {/* Controls Row */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 w-full lg:col-span-3 border-t lg:border-t-0 border-slate-800/60 pt-3 lg:pt-0">
                        <div className="flex items-center gap-1.5">
                          {canEditMenu && canEditSelectedBranch && (
                            <>
                              <button
                                onClick={() => openCatModal(category)}
                                className="p-2 cursor-pointer text-blue-400 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/10 rounded-xl transition-colors"
                                title="Edit Category Details"
                              >
                                <Pencil size={16} />
                              </button>

                              <button
                                onClick={() =>
                                  setDeletePopup({
                                    isOpen: true,
                                    type: "category",
                                    catId: category.id,
                                    itemId: null,
                                  })
                                }
                                className="p-2 cursor-pointer text-rose-400 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-xl transition-colors"
                                title="Permanently Delete Category"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>

                        <button
                          onClick={() =>
                            setExpandedCategory(isCatOpen ? null : category.id)
                          }
                          className={`p-2 cursor-pointer rounded-xl border transition-all ${
                            isCatOpen 
                              ? "bg-indigo-600 text-white border-indigo-500" 
                              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                          }`}
                        >
                          {isCatOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* INTERNALS COMPONENT COLLAPSIBLE */}
                    <AnimatePresence>
                      {isCatOpen && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          className="bg-[#0b0f19] border-t border-slate-800 p-4 sm:p-6"
                        >
                          <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                              Products Catalogue
                            </h3>
                            {canEditMenu ? (
                              <button
                                onClick={() => openItemModal(category.id)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 font-bold transition-all text-xs border border-emerald-500/20 shadow-md cursor-pointer"
                              >
                                <Plus size={14} />
                                Add Item
                              </button>
                            ) : (
                              <p className="text-[11px] text-slate-500 italic">
                                Action disabled due to permissions profile.
                              </p>
                            )}
                          </div>

                          {categoryItems.length === 0 ? (
                            <p className="text-slate-500 text-xs text-center py-6 bg-slate-900/40 rounded-xl border border-slate-900">
                              Is category mein koi products nahi hain.
                            </p>
                          ) : (
                            <div className="grid grid-cols-1 gap-3">
                              {categoryItems.map((item) => {
                                const isItemOpen = expandedItem === item.id;
                                return (
                                  <div
                                    key={item.id}
                                    className="border border-slate-800 rounded-xl overflow-hidden bg-[#131b2e] shadow-sm hover:border-slate-700 transition-colors"
                                  >
                                    <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                      <div className="flex items-center gap-3.5 flex-1">
                                        <img
                                          src={item.img || "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=150"}
                                          alt={item.name}
                                          className="w-14 h-14 rounded-xl object-cover border border-slate-800 shadow-inner shrink-0"
                                        />
                                        <div>
                                          <h4 className="font-bold text-sm text-white">
                                            {item.name}
                                          </h4>
                                          <p className="text-slate-400 text-xs line-clamp-1 max-w-lg mt-0.5">
                                            {item.desc || "No product level log updated."}
                                          </p>
                                          <p className="text-emerald-400 font-bold text-xs mt-1 bg-emerald-500/5 inline-block px-2 py-0.5 rounded border border-emerald-500/10">
                                            Rs. {item.price}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 self-end sm:self-center">
                                        {canEditMenu && canEditSelectedBranch && (
                                          <>
                                            <button
                                              onClick={() => openItemModal(category.id, item)}
                                              className="p-2 cursor-pointer bg-blue-500/10 text-blue-400 border border-blue-500/10 rounded-lg hover:bg-blue-500 hover:text-white transition-all"
                                            >
                                              <Pencil size={13} />
                                            </button>
                                            <button
                                              onClick={() =>
                                                setDeletePopup({
                                                  isOpen: true,
                                                  type: "item",
                                                  catId: category.id,
                                                  itemId: item.id,
                                                })
                                              }
                                              className="p-2 cursor-pointer bg-rose-500/10 text-rose-400 border border-rose-500/10 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                                            >
                                              <Trash2 size={13} />
                                            </button>
                                          </>
                                        )}
                                        <button
                                          onClick={() => setExpandedItem(isItemOpen ? null : item.id)}
                                          className="p-2 cursor-pointer bg-slate-900 text-slate-400 rounded-lg border border-slate-800 hover:text-white transition-colors"
                                        >
                                          {isItemOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                        </button>
                                      </div>
                                    </div>

                                    {/* Item Multi-variant Configuration Spec Sheets */}
                                    <AnimatePresence>
                                      {isItemOpen && (
                                        <motion.div 
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          className="bg-[#0b0f19] border-t border-slate-800 p-4 grid grid-cols-1 md:grid-cols-3 gap-4"
                                        >
                                          {/* Sizes Matrix */}
                                          <div className="bg-[#131b2e] p-3.5 rounded-xl border border-slate-800">
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                              Sizes Configuration ({(item.sizes || []).length})
                                            </h5>
                                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                              {(item.sizes || []).length === 0 ? (
                                                <p className="text-[11px] text-slate-600 italic">No custom sizes mapped.</p>
                                              ) : (
                                                (item.sizes || []).map((s, idx) => (
                                                  <div key={idx} className="bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs flex justify-between items-center">
                                                    <span className="font-semibold text-slate-300">{s.name}</span>
                                                    <span className="text-indigo-400 font-bold">Rs. {s.price}</span>
                                                  </div>
                                                ))
                                              )}
                                            </div>
                                          </div>

                                          {/* Addons Matrix */}
                                          <div className="bg-[#131b2e] p-3.5 rounded-xl border border-slate-800">
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                              Add-ons Additions ({(item.addons || []).length})
                                            </h5>
                                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                              {(item.addons || []).length === 0 ? (
                                                <p className="text-[11px] text-slate-600 italic">No addons configured.</p>
                                              ) : (
                                                (item.addons || []).map((a, idx) => (
                                                  <div key={idx} className="bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs flex justify-between items-center">
                                                    <span className="font-semibold text-slate-300">{a.name}</span>
                                                    <span className="text-indigo-400 font-bold">Rs. {a.price}</span>
                                                  </div>
                                                ))
                                              )}
                                            </div>
                                          </div>

                                          {/* Extras Matrix */}
                                          <div className="bg-[#131b2e] p-3.5 rounded-xl border border-slate-800">
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                              Extras Modifier Set ({(item.extras || []).length})
                                            </h5>
                                            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                              {(item.extras || []).length === 0 ? (
                                                <p className="text-[11px] text-slate-600 italic">No optional extras.</p>
                                              ) : (
                                                (item.extras || []).map((e, idx) => (
                                                  <div key={idx} className="bg-[#0b0f19] border border-slate-800 rounded-lg p-2 text-xs flex justify-between items-center">
                                                    <span className="font-semibold text-slate-300">{e.name}</span>
                                                    <span className="text-indigo-400 font-bold">Rs. {e.price}</span>
                                                  </div>
                                                ))
                                              )}
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* RENDER LOGIC FOR BACK-END SYSTEM DISMISSALS POPUPS */}
      <AnimatePresence>
        {deletePopup.isOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#131b2e] border border-slate-800 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Are you sure?</h3>
              <p className="text-slate-400 text-xs mb-6">
                This action is irreversible and will purge data permanently from the system cluster.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeletePopup({ isOpen: false, type: null, catId: null, itemId: null })}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer border border-slate-800"
                >
                  Cancel
                </button>
                <button
                  onClick={deletePopup.type === "category" ? confirmDeleteCategory : confirmDeleteItem}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-md"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showCatModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div className="bg-[#131b2e] border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-white">
                {editingCat ? "Edit Category" : "Add New Category"}
              </h3>
              <button
                title="Close"
                onClick={() => setShowCatModal(false)}
                className="text-slate-400 hover:text-white rounded-full cursor-pointer transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  value={catForm.name}
                  onChange={(e) =>
                    setCatForm({ ...catForm, name: e.target.value })
                  }
                  className="w-full bg-[#0b0f19] border border-slate-700 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Description
                </label>
                <input
                  type="text"
                  required
                  value={catForm.desc}
                  onChange={(e) =>
                    setCatForm({ ...catForm, desc: e.target.value })
                  }
                  className="w-full bg-[#0b0f19] border border-slate-700 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Banner Image URL
                </label>
                <input
                  type="url"
                  required
                  value={catForm.bannerImg}
                  onChange={(e) =>
                    setCatForm({ ...catForm, bannerImg: e.target.value })
                  }
                  className="w-full bg-[#0b0f19] border border-slate-700 p-3 rounded-xl text-sm text-white focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  title="Close"
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="flex-1 py-3 cursor-pointer border border-slate-700 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  title="Categories Status"
                  type="submit"
                  className="flex-1 cursor-pointer bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-900/20"
                >
                  {editingCat ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showItemModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
          <div
            className="bg-[#131b2e] rounded-2xl p-6 max-w-xl w-full shadow-2xl max-h-[85vh] overflow-y-auto border border-slate-700"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#475569 #0b0f19",
            }}
          >
            <div className="flex justify-between items-center mb-5 sticky top-0 bg-[#131b2e] pb-3 border-b border-slate-700 z-10">
              <h3 className="text-xl font-bold text-white">
                {editingItem ? "Edit Item" : "Add Item"}
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer transition-transform hover:scale-110"
                title="Close Panel"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    required
                    value={itemForm.name}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-[#0b0f19] text-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1">
                    Base Price
                  </label>
                  <input
                    type="text"
                    required
                    value={itemForm.price}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, price: e.target.value })
                    }
                    className="w-full px-3.5 py-2 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-[#0b0f19] text-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Description
                </label>
                <textarea
                  required
                  value={itemForm.desc}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, desc: e.target.value })
                  }
                  className="w-full px-3.5 py-2 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-[#0b0f19] text-white transition-all"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  required
                  value={itemForm.img}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, img: e.target.value })
                  }
                  className="w-full px-3.5 py-2 border border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm bg-[#0b0f19] text-white transition-all"
                />
              </div>

              <div className="border-t border-slate-700 pt-4 space-y-4">
                <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-300">
                      Sizes{" "}
                      <span className="text-[10px] text-slate-500">
                        (Click tag to edit)
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (newSize.name) {
                          setItemForm({
                            ...itemForm,
                            sizes: [...(itemForm.sizes || []), newSize],
                          });
                          setNewSize({ name: "", price: "" });
                        }
                      }}
                      className="text-blue-500 text-xs font-bold hover:text-blue-400 cursor-pointer"
                    >
                      + Add Size
                    </button>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Size (e.g. Large)"
                      value={newSize.name}
                      onChange={(e) =>
                        setNewSize({ ...newSize, name: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border border-slate-700 rounded-lg text-xs bg-[#131b2e] text-white focus:outline-none focus:border-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Price"
                      value={newSize.price}
                      onChange={(e) =>
                        setNewSize({ ...newSize, price: e.target.value })
                      }
                      className="w-24 px-3 py-2 border border-slate-700 rounded-lg text-xs bg-[#131b2e] text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {itemForm.sizes?.map((s, i) => (
                      <span
                        key={i}
                        onClick={() => {
                          setNewSize({ name: s.name, price: s.price });
                          setItemForm({
                            ...itemForm,
                            sizes: itemForm.sizes.filter((_, idx) => idx !== i),
                          });
                        }}
                        className="bg-blue-950 text-blue-300 border border-blue-900 text-[11px] px-2 py-0.5 rounded-md font-medium cursor-pointer flex items-center gap-1"
                      >
                        {s.name} (Rs.{s.price}){" "}
                        <span className="text-blue-500 font-bold ml-0.5">
                          ×
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-300">
                      Add-ons{" "}
                      <span className="text-[10px] text-slate-500">
                        (Click tag to edit)
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (newAddon.name) {
                          setItemForm({
                            ...itemForm,
                            addons: [...(itemForm.addons || []), newAddon],
                          });
                          setNewAddon({ name: "", price: "" });
                        }
                      }}
                      className="text-emerald-500 text-xs font-bold hover:text-emerald-400 cursor-pointer"
                    >
                      + Add Addon
                    </button>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Addon Item"
                      value={newAddon.name}
                      onChange={(e) =>
                        setNewAddon({ ...newAddon, name: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border border-slate-700 rounded-lg text-xs bg-[#131b2e] text-white focus:outline-none focus:border-emerald-500"
                    />
                    <input
                      type="text"
                      placeholder="Price"
                      value={newAddon.price}
                      onChange={(e) =>
                        setNewAddon({ ...newAddon, price: e.target.value })
                      }
                      className="w-24 px-3 py-2 border border-slate-700 rounded-lg text-xs bg-[#131b2e] text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {itemForm.addons?.map((a, i) => (
                      <span
                        key={i}
                        onClick={() => {
                          setNewAddon({ name: a.name, price: a.price });
                          setItemForm({
                            ...itemForm,
                            addons: itemForm.addons.filter(
                              (_, idx) => idx !== i,
                            ),
                          });
                        }}
                        className="bg-emerald-950 text-emerald-300 border border-emerald-900 text-[11px] px-2 py-0.5 rounded-md font-medium cursor-pointer flex items-center gap-1"
                      >
                        {a.name} (Rs.{a.price}){" "}
                        <span className="text-emerald-500 font-bold ml-0.5">
                          ×
                        </span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-[#0b0f19] p-3 rounded-xl border border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-300">
                      Extras{" "}
                      <span className="text-[10px] text-slate-500">
                        (Click tag to edit)
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (newExtra.name) {
                          setItemForm({
                            ...itemForm,
                            extras: [...(itemForm.extras || []), newExtra],
                          });
                          setNewExtra({ name: "", price: "" });
                        }
                      }}
                      className="text-orange-500 text-xs font-bold hover:text-orange-400 cursor-pointer"
                    >
                      + Add Extra
                    </button>
                  </div>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Extra Optional"
                      value={newExtra.name}
                      onChange={(e) =>
                        setNewExtra({ ...newExtra, name: e.target.value })
                      }
                      className="flex-1 px-3 py-2 border border-slate-700 rounded-lg text-xs bg-[#131b2e] text-white focus:outline-none focus:border-orange-500"
                    />
                    <input
                      type="text"
                      placeholder="Price"
                      value={newExtra.price}
                      onChange={(e) =>
                        setNewExtra({ ...newExtra, price: e.target.value })
                      }
                      className="w-24 px-3 py-2 border border-slate-700 rounded-lg text-xs bg-[#131b2e] text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {itemForm.extras?.map((e, i) => (
                      <span
                        key={i}
                        onClick={() => {
                          setNewExtra({ name: e.name, price: e.price });
                          setItemForm({
                            ...itemForm,
                            extras: itemForm.extras.filter(
                              (_, idx) => idx !== i,
                            ),
                          });
                        }}
                        className="bg-orange-950 text-orange-300 border border-orange-900 text-[11px] px-2 py-0.5 rounded-md font-medium cursor-pointer flex items-center gap-1"
                      >
                        {e.name} (Rs.{e.price}){" "}
                        <span className="text-orange-500 font-bold ml-0.5">
                          ×
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-700 sticky bottom-0 bg-[#131b2e] mt-4">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 py-2.5 cursor-pointer border border-slate-700 rounded-xl text-sm font-semibold text-slate-400 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 cursor-pointer bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
                >
                  {editingItem ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletePopup.isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[10000] p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#0b0f19] rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center border border-gray-600 transform transition-transform scale-100">
            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">
              Delete Menu Resource?
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm mt-2 leading-relaxed">
              {deletePopup.type === "category"
                ? "Are you sure you want to delete this category? Removing it will permanently delete all associated items and nested attributes from the menu matrix."
                : "Are you sure you want to permanently remove this product item from your active menu layout? This action cannot be reversed."}
            </p>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() =>
                  setDeletePopup({
                    isOpen: false,
                    type: null,
                    catId: null,
                    itemId: null,
                  })
                }
                className="flex-1 py-2.5 cursor-pointer border border-gray-600 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-400 transition-colors"
                title="Cancel deletion sequence safely"
              >
                No, Cancel
              </button>
              <button
                type="button"
                onClick={
                  deletePopup.type === "category"
                    ? confirmDeleteCategory
                    : confirmDeleteItem
                }
                className="flex-1 cursor-pointer bg-red-600 hover:bg-red-600 text-white py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-sm"
                title="Confirm and delete asset resource execution"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}