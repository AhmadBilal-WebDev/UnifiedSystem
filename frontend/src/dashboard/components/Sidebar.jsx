import React from 'react';
import { useApp } from '../contexts/AppContext';
import { LiveDot } from './ui';
import { ROLE_LABELS } from '../data/mockData';

const NAV_ITEMS = [
  { id:'dashboard',  label:'Dashboard'      },
  { id:'counter',    label:'Counter Panel'  },
  { id:'orders',     label:'Orders'         },
  { id:'kitchen',    label:'Kitchen'        },
  { id:'pos',        label:'POS Integration'},
  { id:'products',   label:'Products'       },
  { id:'categories', label:'Categories'     },
  { id:'branches',   label:'Branches'       },
  { id:'inventory',  label:'Inventory'      },
  { id:'staff',      label:'Staff'          },
  { id:'analytics',  label:'Analytics'      },
  { id:'reports',    label:'Reports'        },
  { id:'settings',   label:'Settings'       },
];

const ICONS = {
  dashboard:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  counter:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.5a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .7h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.37a16 16 0 006.72 6.72l1.06-1.06a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
  orders:     <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
  kitchen:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>,
  pos:        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  products:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
  categories: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>,
  branches:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  inventory:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  staff:      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  analytics:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  reports:    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  settings:   <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
};

export default function Sidebar() {
  const {
    activeNav, setActiveNav, sidebarCollapsed, setSidebarCollapsed,
    currentUser, orderList, getPendingConfirmOrders, branchList, hasPermission,
  } = useApp();

  const collapsed  = sidebarCollapsed;
  const liveOrders = orderList.filter(o => ['pending','confirmed','preparing','ready'].includes(o.status)).length;
  const codPending = getPendingConfirmOrders().length;
  const posBranches = branchList.filter(b => b.posEnabled).length;
  const badges     = { orders: liveOrders, counter: codPending, pos: posBranches };

  // Use page-level check (string like 'orders', 'counter', etc.)
  const visibleNav = NAV_ITEMS.filter(n => hasPermission(n.id));
  const clientName = currentUser?.role === 'super_admin' ? 'Agency Admin' : 'BurgerBlast Co.';

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div style={{ height:58, display:'flex', alignItems:'center', justifyContent: collapsed ? 'center' : 'space-between', padding: collapsed ? '0' : '0 14px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        {collapsed ? (
          <button onClick={() => setSidebarCollapsed(false)} style={{ width:34, height:34, background:'var(--accent)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', border:'none', cursor:'pointer', color:'#fff', fontWeight:900, fontSize:13 }}>ROS</button>
        ) : (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:9 }}>
              <div style={{ width:32, height:32, background:'var(--accent)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:900, fontSize:12, letterSpacing:-.5 }}>ROS</div>
              <div>
                <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:13, letterSpacing:'-.02em', lineHeight:1 }}>RestaurantOS</div>
                <div style={{ fontSize:9, color:'var(--text-m)', fontWeight:600, marginTop:1 }}>{clientName}</div>
              </div>
            </div>
            <button onClick={() => setSidebarCollapsed(true)} style={{ width:24, height:24, background:'none', border:'1px solid var(--border)', borderRadius:'var(--r)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-m)', fontSize:11 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15,18 9,12 15,6"/></svg>
            </button>
          </>
        )}
      </div>

      <nav style={{ flex:1, padding:'10px 7px', overflowY:'auto', overflowX:'hidden' }}>
        {visibleNav.map(n => {
          const isActive = activeNav === n.id;
          const badge    = badges[n.id];
          return (
            <button key={n.id} onClick={() => setActiveNav(n.id)} className={`nav-item ${isActive ? 'active' : ''}`}>
              <span style={{ flexShrink:0, opacity: isActive ? 1 : 0.7 }}>{ICONS[n.id] || ICONS.settings}</span>
              {!collapsed && <span>{n.label}</span>}
              {!collapsed && badge > 0 && (
                <span style={{ marginLeft:'auto', minWidth:18, height:18, background:'var(--accent)', borderRadius:99, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:900, color:'#fff', padding:'0 5px' }}>{badge}</span>
              )}
              {collapsed && badge > 0 && (
                <span style={{ position:'absolute', top:5, right:5, width:7, height:7, background:'var(--accent)', borderRadius:'50%' }}/>
              )}
            </button>
          );
        })}
      </nav>

      {!collapsed && currentUser && (
        <div style={{ padding:12, borderTop:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:`${currentUser.color}22`, border:`1px solid ${currentUser.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:12, color:currentUser.color, flexShrink:0 }}>{currentUser.avatar}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:12, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{currentUser.name}</div>
            <div style={{ fontSize:10, color:'var(--text-m)', textTransform:'capitalize' }}>{ROLE_LABELS[currentUser.role]||currentUser.role}</div>
          </div>
          <LiveDot color="var(--green)" size={8}/>
        </div>
      )}
    </aside>
  );
}
