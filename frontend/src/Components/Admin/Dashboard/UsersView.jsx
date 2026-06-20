import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Mail,
  Phone,
  Calendar,
  Users,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UsersView({ selectedBranchId }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!selectedBranchId) return;

      setLoading(true);
      try {
        const token = localStorage.getItem("adminToken");
        // URL check karein: endpoint sahi hona chahiye
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/admin/registered-users?parentBranchId=${selectedBranchId}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [selectedBranchId]);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalUsers = users.length;
  const activeThisMonth = users.filter(
    (u) => new Date(u.createdAt).getMonth() === new Date().getMonth(),
  ).length;

  if (loading)
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
    <div className="p-4 sm:p-8 bg-[#0b0f19] min-h-screen text-slate-200 select-none">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-slate-800/60 pb-8 px-4 lg:px-0"
        >
          <div className="flex gap-4 w-full md:w-auto items-center">
            <div className="p-3.5 bg-slate-800 text-blue-400 rounded-2xl border border-slate-700">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                Registered Registry
              </h2>
              <p className="text-xs text-slate-400 tracking-widest font-bold">
                Manage system users
              </p>
            </div>
          </div>

          <div className="relative w-full md:w-80 group">
            <Search
              className="absolute left-3.5 top-3.5 text-slate-500"
              size={16}
            />
            <input
              type="text"
              placeholder="Search user by Name..."
              className="w-full bg-[#131b2e] border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-xs text-white focus:outline-none focus:border-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </motion.div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              title: "Total Users",
              val: totalUsers,
              color: "text-blue-400",
              bg: "bg-blue-400",
            },
            {
              title: "Registered Today",
              val: users.filter(
                (u) =>
                  new Date(u.createdAt).toISOString().split("T")[0] ===
                  new Date().toISOString().split("T")[0],
              ).length,
              icon: ShieldCheck,
              color: "text-emerald-400",
              bg: "bg-emerald-400",
            },
            {
              title: "New This Month",
              val: activeThisMonth,
              icon: Activity,
              color: "text-amber-400",
              bg: "bg-amber-400",
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#131b2e] border border-slate-800 rounded-2xl p-4 relative overflow-hidden group hover:border-slate-700 hover:scale-[1.01] cursor-pointer transition-all duration-300"
            >
              <div
                className={`absolute -right-4 -top-4 w-20 h-20 ${card.bg.replace("bg-", "bg-opacity-10 bg-")} rounded-full blur-2xl`}
              />
              <div className="relative z-10">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                  {card.title}
                </p>
                <h3 className={`text-2xl font-black ${card.color} mt-1`}>
                  {card.val}
                </h3>
              </div>
              <div className="flex items-end justify-between gap-1 mt-4 h-8 relative z-10">
                {[35, 60, 45, 80, 55, 90].map((h, idx) => (
                  <div
                    key={idx}
                    className={`w-full rounded-t-sm opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${card.bg}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- DYNAMIC RESPONSIVE PROPORTIONAL GRID CONTAINER --- */}
        <div className="w-full overflow-x-auto bg-[#131b2e] border border-slate-800 rounded-2xl scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {/* Table row min-width is locked to 1100px so it stretches cleanly with no residual empty spaces */}
          <div className="min-w-[1100px] w-full">
            {/* Table Header Row Segment */}
            <div className="grid grid-cols-[1.2fr_1fr_1.3fr_1fr_1fr_0.8fr] bg-[#0b0f19]/40 border-b border-slate-800/80 px-6 py-4 text-[10px] uppercase font-black text-slate-400 tracking-wider items-center">
              <div>Customer Profile</div>
              <div>Contact Context</div>
              <div>Email Address</div>
              <div>Joined Date</div>
              <div>Role / Type</div>
              <div className="">Status</div>
            </div>

            {/* Table Body Iteration Matrix */}
            <motion.div layout className="divide-y divide-slate-800/60">
              <AnimatePresence mode="popLayout">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={user._id}
                      className="grid grid-cols-[1.2fr_1fr_1.3fr_1fr_1fr_0.8fr] items-center px-6 py-4 hover:bg-[#18223b]/50 cursor-pointer border-l-2 border-transparent hover:border-blue-500/70 transition-all duration-150 text-xs text-slate-300"
                    >
                      {/* Column 1: Customer Profile */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-black text-sm border border-blue-500/20 flex-shrink-0">
                          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3
                            className="font-bold text-white capitalize truncate block max-w-[160px]"
                            title={user.name}
                          >
                            {user.name}
                          </h3>
                        </div>
                      </div>

                      {/* Column 2: Contact Context */}
                      <div className="flex items-center gap-2 text-slate-300 min-w-0 truncate">
                        <Phone
                          size={13}
                          className="text-indigo-400 flex-shrink-0"
                        />
                        <span className="font-mono font-medium truncate">
                          {user.phone || "N/A"}
                        </span>
                      </div>

                      {/* Column 3: Email Address */}
                      <div className="flex items-center gap-2 text-slate-400 min-w-0 truncate pr-3">
                        <Mail
                          size={13}
                          className="text-blue-400 flex-shrink-0"
                        />
                        <span className="truncate" title={user.email}>
                          {user.email}
                        </span>
                      </div>

                      {/* Column 4: Joined Date */}
                      <div className="flex items-center gap-2 text-slate-400 min-w-0">
                        <Calendar
                          size={13}
                          className="text-emerald-400 flex-shrink-0"
                        />
                        <span className="font-medium">
                          {new Date(user.createdAt).toLocaleDateString("en-PK")}
                        </span>
                      </div>

                      {/* Column 5: Role / Type */}
                      <div className="flex items-center">
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest bg-slate-800/40 px-2.5 py-1 rounded-md border border-slate-700/40 shadow-inner">
                          Customer
                        </span>
                      </div>

                      {/* Column 6: Status -> Pushed fully to the right wall border */}
                      <div className="text-right flex items-center">
                        <span className="inline-block px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 rounded-md border border-emerald-500/20 shadow-xs">
                          Active
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-16 text-center flex flex-col items-center justify-center"
                  >
                    <div className="w-14 h-14 bg-blue-500/5 rounded-full flex items-center justify-center mb-4 border border-blue-500/10">
                      <Search size={24} className="text-slate-600" />
                    </div>
                    <h3 className="text-white font-bold text-sm mb-1">
                      No results found
                    </h3>
                    <p className="text-slate-500 text-xs max-w-xs">
                      We couldn't find any users matching your search.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
        {/* --- CONTAINER ENDED --- */}
      </div>
    </div>
  );
}
