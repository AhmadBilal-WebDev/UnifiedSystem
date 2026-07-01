import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { LiveDot } from './ui';
import { ROLE_LABELS } from '../data/mockData';

const TITLES = {
  dashboard:'Dashboard', counter:'Counter Panel', orders:'Order Management',
  kitchen:'Kitchen Display', products:'Menu & Products', categories:'Categories',
  branches:'Branches', inventory:'Inventory', staff:'Staff & Roles',
  analytics:'Analytics', reports:'Reports', settings:'Settings', pos:'POS Integration',
};

const NOTIF_COLORS = {
  order:'var(--accent)', alert:'var(--red)', pos:'var(--blue)',
  review:'var(--yellow)', system:'var(--text-m)',
};

const NOTIF_NAV_LABELS = {
  counter:'Open Counter', orders:'View Order', branches:'View Branch',
  inventory:'View Inventory', pos:'View POS', analytics:'View Analytics',
  reports:'View Reports', settings:'Open Settings',
};

export default function Topbar() {
  const {
    activeNav, navigateTo, currentUser, logout, toggleTheme, theme,
    notifList, markAllNotifRead, unreadNotifCount,
    getPendingConfirmOrders, getAccessibleBranches, activeBranchId, setActiveBranchId,
    handleNotifClick, openMobileMenu,
  } = useApp();

  const [time,        setTime       ] = useState(new Date());
  const [showNotifs,  setShowNotifs ] = useState(false);
  const [showUser,    setShowUser   ] = useState(false);
  const notifRefDesktop = useRef(null);
  const notifRefMobile  = useRef(null);
  const userRefDesktop  = useRef(null);
  const userRefMobile   = useRef(null);
  const codCount  = getPendingConfirmOrders().length;
  const branches  = getAccessibleBranches();

  const isInside = (refs, target) =>
    refs.some((ref) => ref.current?.contains(target));

  const handleSettings = () => {
    navigateTo('settings');
    setShowUser(false);
  };

  const handleLogout = () => {
    setShowUser(false);
    logout();
  };

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (!isInside([notifRefDesktop, notifRefMobile], e.target)) setShowNotifs(false);
      if (!isInside([userRefDesktop, userRefMobile], e.target)) setShowUser(false);
    };
    document.addEventListener('click', h);
    return () => document.removeEventListener('click', h);
  }, []);

  const onNotifClick = (n) => {
    handleNotifClick(n);        // marks read + navigates
    setShowNotifs(false);
  };

  const selectedBranch = branches.find(b => String(b.id) === String(activeBranchId));

  return (
    <header className="topbar">
      <div className="topbar-row">
        <button
          type="button"
          className="menu-toggle"
          onClick={openMobileMenu}
          aria-label="Open navigation menu"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <div className="topbar-title-wrap">
          <h1 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:15, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {TITLES[activeNav] || 'Dashboard'}
          </h1>
          {activeBranchId && selectedBranch && (
            <div style={{ fontSize:10, color:'var(--accent)', fontWeight:700, marginTop:1, letterSpacing:'.02em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {selectedBranch.name}
            </div>
          )}
        </div>

        <div className="topbar-actions hide-mobile">
          {codCount > 0 && (
            <button onClick={() => navigateTo('counter')}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px', background:'var(--accent-soft)', border:'1px solid rgba(232,82,26,.44)', borderRadius:99, cursor:'pointer', fontSize:11, fontWeight:800, color:'var(--accent)', animation:'anim-pulse 2s infinite', flexShrink:0 }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)' }}/>
              {codCount} COD Pending
            </button>
          )}

          {branches.length > 1 && (
            <select
              className="input topbar-branch-select"
              value={activeBranchId || ''}
              onChange={e => setActiveBranchId(e.target.value || null)}
              style={{ width:'auto', minWidth:150, maxWidth:210, padding:'5px 28px 5px 10px', fontSize:12, flexShrink:0, fontWeight:600 }}>
              <option value="">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.city}{b.status !== 'open' ? ` (${b.status})` : ''}
                </option>
              ))}
            </select>
          )}

          <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'var(--text-s)', flexShrink:0, letterSpacing:'.04em' }}>
            {time.toLocaleTimeString('en', { hour12:false })}
          </div>

          <button onClick={toggleTheme} title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
            style={{ width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'var(--r)', background:'var(--elevated)', border:'1px solid var(--border)', cursor:'pointer', flexShrink:0 }}>
            {theme === 'dark'
              ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            }
          </button>

          <NotifBell
            notifRef={notifRefDesktop}
            showNotifs={showNotifs}
            setShowNotifs={setShowNotifs}
            markAllNotifRead={markAllNotifRead}
            unreadNotifCount={unreadNotifCount}
            notifList={notifList}
            onNotifClick={onNotifClick}
          />

          <UserMenu
            userRef={userRefDesktop}
            showUser={showUser}
            setShowUser={setShowUser}
            currentUser={currentUser}
            onSettings={handleSettings}
            onLogout={handleLogout}
          />
        </div>
      </div>

      <div className="topbar-actions-row show-mobile-only">
        {codCount > 0 && (
          <button onClick={() => navigateTo('counter')}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 12px', background:'var(--accent-soft)', border:'1px solid rgba(232,82,26,.44)', borderRadius:99, cursor:'pointer', fontSize:11, fontWeight:800, color:'var(--accent)', animation:'anim-pulse 2s infinite', flexShrink:0 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)' }}/>
            {codCount} COD
          </button>
        )}

        {branches.length > 1 && (
          <select
            className="input topbar-branch-select"
            value={activeBranchId || ''}
            onChange={e => setActiveBranchId(e.target.value || null)}
            style={{ width:'auto', minWidth:120, padding:'5px 28px 5px 10px', fontSize:12, flexShrink:0, fontWeight:600 }}>
            <option value="">All Branches</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name}{b.status !== 'open' ? ` (${b.status})` : ''}
              </option>
            ))}
          </select>
        )}

        <button onClick={toggleTheme} title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          style={{ width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'var(--r)', background:'var(--elevated)', border:'1px solid var(--border)', cursor:'pointer', flexShrink:0 }}>
          {theme === 'dark'
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/></svg>
          }
        </button>

        <NotifBell
          notifRef={notifRefMobile}
          showNotifs={showNotifs}
          setShowNotifs={setShowNotifs}
          markAllNotifRead={markAllNotifRead}
          unreadNotifCount={unreadNotifCount}
          notifList={notifList}
          onNotifClick={onNotifClick}
        />

        <UserMenu
          userRef={userRefMobile}
          showUser={showUser}
          setShowUser={setShowUser}
          currentUser={currentUser}
          onSettings={handleSettings}
          onLogout={handleLogout}
        />
      </div>
    </header>
  );
}

function NotifBell({ notifRef, showNotifs, setShowNotifs, markAllNotifRead, unreadNotifCount, notifList, onNotifClick }) {
  return (
    <div ref={notifRef} style={{ position:'relative' }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setShowNotifs(v => !v); if (!showNotifs) markAllNotifRead(); }}
        style={{ position:'relative', width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'var(--r)', background: showNotifs ? 'var(--elevated)' : 'none', border:`1px solid ${showNotifs ? 'var(--border)' : 'transparent'}`, cursor:'pointer', flexShrink:0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {unreadNotifCount > 0 && (
          <span style={{ position:'absolute', top:5, right:5, width:8, height:8, borderRadius:'50%', background:'var(--accent)' }}>
            <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'var(--accent)', animation:'ping 1.4s infinite', opacity:.7 }}/>
          </span>
        )}
      </button>

      {showNotifs && (
        <div className="dropdown-panel dropdown-panel--notifs fade-in">
            <div style={{ padding:'14px 16px 10px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border)' }}>
              <span style={{ fontWeight:700, fontSize:13 }}>Notifications</span>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                {unreadNotifCount > 0 && <span className="badge badge-orange">{unreadNotifCount} new</span>}
                <button onClick={markAllNotifRead} style={{ fontSize:11, color:'var(--accent)', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>
                  Mark all read
                </button>
              </div>
            </div>

            <div style={{ maxHeight:420, overflowY:'auto' }}>
              {notifList.length === 0 && (
                <div style={{ textAlign:'center', padding:'40px 20px', color:'var(--text-m)', fontSize:12 }}>
                  No notifications
                </div>
              )}
              {notifList.slice(0, 12).map(n => {
                const dotColor = NOTIF_COLORS[n.type] || 'var(--text-m)';
                const elapsed  = Math.round((Date.now() - new Date(n.time)) / 60000);
                const timeStr  = elapsed < 60 ? `${elapsed}m ago` : elapsed < 1440 ? `${Math.floor(elapsed/60)}h ago` : `${Math.floor(elapsed/1440)}d ago`;
                const actionLabel = n.navTarget ? (NOTIF_NAV_LABELS[n.navTarget] || 'Open') : null;

                return (
                  <div key={n.id}
                    style={{ display:'flex', gap:10, padding:'12px 16px', borderBottom:'1px solid var(--border)', background: n.read ? 'none' : `${dotColor}07`, transition:'.1s' }}>
                    {/* Colored type indicator */}
                    <div style={{ flexShrink:0, marginTop:3 }}>
                      <span style={{ display:'block', width:8, height:8, borderRadius:'50%', background:dotColor }}/>
                    </div>

                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:6 }}>
                        <div style={{ fontSize:12, fontWeight: n.read ? 500 : 700, color:'var(--text-s)', lineHeight:1.4 }}>
                          {n.title}
                        </div>
                        <span style={{ fontSize:10, color:'var(--text-m)', flexShrink:0, marginTop:1 }}>{timeStr}</span>
                      </div>
                      <div style={{ fontSize:11, color:'var(--text-m)', marginTop:3, lineHeight:1.45 }}>
                        {n.message}
                      </div>

                      {/* Deep-link action button */}
                      {actionLabel && (
                        <button
                          onClick={() => onNotifClick(n)}
                          style={{ marginTop:8, padding:'4px 12px', fontSize:11, fontWeight:700, borderRadius:99, cursor:'pointer', background: `${dotColor}18`, color: dotColor, border:`1px solid ${dotColor}44`, transition:'.12s', display:'inline-flex', alignItems:'center', gap:5 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9,18 15,12 9,6"/></svg>
                          {actionLabel}
                        </button>
                      )}

                      {/* Priority badge */}
                      {n.priority === 'high' && !n.read && (
                        <span className="badge badge-red" style={{ marginTop:6, marginLeft:0, fontSize:9 }}>Urgent</span>
                      )}
                    </div>

                    {!n.read && (
                      <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--accent)', flexShrink:0, marginTop:5 }}/>
                    )}
                  </div>
                );
              })}
            </div>

            {notifList.length > 12 && (
              <div style={{ padding:'10px 16px', borderTop:'1px solid var(--border)', textAlign:'center' }}>
                <button onClick={() => setShowNotifs(false)} style={{ fontSize:11, color:'var(--accent)', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>
                  View all {notifList.length} notifications
                </button>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

function UserMenu({ userRef, showUser, setShowUser, currentUser, onSettings, onLogout }) {
  return (
    <div ref={userRef} style={{ position:'relative' }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setShowUser(v => !v); }}
        style={{ width:34, height:34, borderRadius:8, background: currentUser ? `${currentUser.color}22` : 'var(--elevated)', border: currentUser ? `1px solid ${currentUser.color}44` : '1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:12, color: currentUser?.color || 'var(--text)', cursor:'pointer' }}>
        {currentUser?.avatar || '?'}
      </button>

      {showUser && (
        <div className="dropdown-panel dropdown-panel--user fade-in" onClick={(e) => e.stopPropagation()}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ fontWeight:700, fontSize:13 }}>{currentUser?.name}</div>
            <div style={{ fontSize:11, color:'var(--text-m)', marginTop:2, wordBreak:'break-word' }}>{currentUser?.email}</div>
            <span className="badge badge-orange" style={{ marginTop:6 }}>{ROLE_LABELS[currentUser?.role] || currentUser?.role}</span>
          </div>
          <button
            type="button"
            onClick={onSettings}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 16px', background:'none', border:'none', color:'var(--text-s)', fontSize:13, cursor:'pointer', transition:'.12s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            Settings
          </button>
          <button
            type="button"
            onClick={onLogout}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'11px 16px', background:'none', border:'none', color:'var(--red)', fontSize:13, cursor:'pointer', transition:'.12s', borderTop:'1px solid var(--border)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--red-soft)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
