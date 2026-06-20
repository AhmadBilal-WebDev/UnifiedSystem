import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, ComposedChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useApp } from '../contexts/AppContext';
import { MetricCard, SectionHeader, CustomTooltip, fmt, LiveDot } from '../components/ui';
import { SOURCE_LABELS, SOURCE_COLORS } from '../data/mockData';
import api from '../services/api';

const STATUS_COLORS = {
  pending:'var(--yellow)', confirmed:'var(--blue)', preparing:'var(--accent)',
  ready:'var(--green)', delivered:'var(--text-m)', cancelled:'var(--red)',
};

export default function Dashboard() {
  const { orderList, userList, getClientProducts, getClientBranches, activeClientId, currentUser, setActiveNav, activeBranchId, branchList } = useApp();

  // ── Real stats + revenue chart from the backend ──────────────────────────
  const [stats, setStats]   = useState(null);
  const [revData, setRevData] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingStats(true);
    Promise.all([
      api.dashboard.getStats(activeBranchId ? { branchId: activeBranchId } : {}),
      api.dashboard.getRevenueChart(activeBranchId ? { branchId: activeBranchId, days: 30 } : { days: 30 }),
    ]).then(([statsRes, chartRes]) => {
      if (cancelled) return;
      setStats(statsRes.data);
      setRevData(chartRes.data || []);
    }).catch(() => {
      if (cancelled) return;
      setStats(null);
      setRevData([]);
    }).finally(() => { if (!cancelled) setLoadingStats(false); });
    return () => { cancelled = true; };
  }, [activeBranchId]);

  const spark7 = revData.slice(-7);

  const products  = getClientProducts();
  const branches  = activeBranchId
    ? getClientBranches().filter(b => b.id === activeBranchId)
    : getClientBranches();

  // Live orders filtered by branch
  const liveOrders = useMemo(() => orderList.filter(o => {
    if (activeBranchId && o.branchId !== activeBranchId && o.branchId?._id !== activeBranchId) return false;
    return ['pending','confirmed','preparing','ready'].includes(o.status);
  }).slice(0, 8), [orderList, activeBranchId]);

  const todayRev  = revData[revData.length-1]?.revenue || 0;
  const ystdRev   = revData[revData.length-2]?.revenue || 0;
  const dayDelta  = ystdRev > 0 ? parseFloat(((todayRev - ystdRev) / ystdRev * 100).toFixed(1)) : 0;

  const topProducts = [...products].sort((a, b) => (b.sold||0) - (a.sold||0)).slice(0, 6);
  const maxSold      = Math.max(...topProducts.map(p => p.sold||0), 1);
  const COLORS       = ['var(--accent)','var(--blue)','var(--green)','var(--purple)','var(--yellow)','var(--cyan)'];

  // Source breakdown for today, filtered by branch — computed from real orderList
  const today = new Date();
  const todayOrders = useMemo(() => orderList.filter(o => {
    if (activeBranchId && o.branchId !== activeBranchId && o.branchId?._id !== activeBranchId) return false;
    return new Date(o.createdAt).toDateString() === today.toDateString();
  }), [orderList, activeBranchId]);

  const sourceBreakdown = Object.entries(SOURCE_LABELS).map(([k,l]) => ({
    name: l,
    value: todayOrders.filter(o => o.source === k).length,
    color: SOURCE_COLORS[k],
  })).filter(x => x.value > 0);

  const recentActivity = useMemo(() => orderList.filter(o => {
    if (activeBranchId && o.branchId !== activeBranchId && o.branchId?._id !== activeBranchId) return false;
    return ['pending','confirmed','preparing','ready','cancelled'].includes(o.status);
  }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5), [orderList, activeBranchId]);

  const activeBranchName = activeBranchId ? branchList.find(b => b.id === activeBranchId)?.name : null;

  // ── Branch Performance Matrix — computed live from real orderList/userList ──
  const branchPerf = useMemo(() => branches.map(b => {
    const bOrders = orderList.filter(o => (o.branchId === b.id || o.branchId?._id === b.id));
    const monthAgo = new Date(Date.now() - 30 * 86400000);
    const mtdOrders = bOrders.filter(o => new Date(o.createdAt) >= monthAgo && o.status !== 'cancelled');
    const revenue = mtdOrders.reduce((s,o) => s + (o.total||0), 0);
    const staffCount = userList.filter(u => (u.branchIds||[]).some(bid => bid === b.id || bid?.toString() === b.id)).length;
    const health = Math.min(100, Math.round((b.rating/5)*50 + Math.min(mtdOrders.length, 500)/500*50));
    return { ...b, mtdRevenue: revenue, mtdOrders: mtdOrders.length, staffCount, health };
  }), [branches, orderList, userList]);

  return (
    <div style={{ padding:24, display:'flex', flexDirection:'column', gap:22 }}>

      {/* Hero Banner */}
      <div className="card fade-up" style={{ background:'linear-gradient(135deg,var(--bg-3) 0%,var(--bg-2) 100%)', border:'1px solid var(--border-l)', padding:'22px 28px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, right:0, width:340, height:'100%', background:'radial-gradient(ellipse at right,var(--accent-soft),transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap', position:'relative' }}>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:20, fontWeight:800, letterSpacing:'-.02em' }}>
              Welcome, {currentUser?.name?.split(' ')[0]}
            </div>
            <div style={{ fontSize:12, color:'var(--text-s)', marginTop:4, display:'flex', gap:14, flexWrap:'wrap' }}>
              {activeBranchName ? (
                <span style={{ color:'var(--accent)', fontWeight:700 }}>Viewing: {activeBranchName}</span>
              ) : (
                <span style={{ display:'flex', alignItems:'center', gap:5 }}><LiveDot color="var(--green)"/> {branches.filter(b=>b.status==='open').length} branches live</span>
              )}
              <span style={{ color:'var(--text-m)' }}>·</span>
              <span>{branches.filter(b=>b.posEnabled).length} POS connected</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {[
              { label:'Live Orders',   value: stats?.activeOrders ?? '—',    color:'var(--green)',  bg:'var(--green-soft)',  nav:'orders'  },
              { label:'COD Pending',   value: stats?.codPending ?? '—',       color:'var(--yellow)', bg:'var(--yellow-soft)', nav:'counter' },
              { label:'Today Revenue', value: stats ? fmt(stats.todayRevenue) : '—', color:'var(--accent)', bg:'var(--accent-soft)', nav:'analytics' },
              { label:'Week Revenue',  value: stats ? fmt(stats.weekRevenue) : '—', color:'var(--blue)', bg:'var(--blue-soft)',  nav:'analytics' },
            ].map(s => (
              <div key={s.label} onClick={() => setActiveNav(s.nav)}
                style={{ background:s.bg, borderRadius:'var(--r)', padding:'10px 16px', textAlign:'center', cursor:'pointer' }}>
                <div style={{ fontSize:20, fontWeight:900, color:s.color, fontFamily:"'Plus Jakarta Sans',sans-serif", lineHeight:1 }}>{s.value}</div>
                <div style={{ fontSize:9, color:s.color, fontWeight:800, marginTop:3, letterSpacing:'.06em', whiteSpace:'nowrap' }}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="stat-grid">
        <MetricCard label="Today's Revenue"   value={fmt(todayRev)}         sub={stats ? `${stats.todayOrders} orders` : '—'}           icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>} color="var(--accent)" trend={dayDelta}  sparkData={spark7} delay={0}/>
        <MetricCard label="Week Revenue"       value={stats ? fmt(stats.weekRevenue) : '—'} sub={stats ? `${stats.weekGrowth}% vs prev week` : '—'}    icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22,7 13.5,15.5 8.5,10.5 2,17"/><polyline points="16,7 22,7 22,13"/></svg>} color="var(--blue)"   trend={stats ? parseFloat(stats.weekGrowth) : 0} sparkData={spark7} delay={60}/>
        <MetricCard label="Active Orders"      value={stats?.activeOrders ?? '—'}   sub="Across branches"                         icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>} color="var(--green)"  trend={0} delay={120} badge={{t:'Live',c:'green'}}/>
        <MetricCard label="Total Customers"    value={stats?.totalCustomers ?? '—'} sub="Registered" icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>} color="var(--purple)" trend={0} delay={180}/>
      </div>

      {/* Revenue Chart + Source Mix */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:16 }}>
        <div className="card fade-up" style={{ animationDelay:'200ms' }}>
          <SectionHeader title={`Revenue — 30 Days${activeBranchName ? ` · ${activeBranchName}` : ''}`} sub="Daily trend">
            <button className="btn btn-ghost" style={{ fontSize:11 }} onClick={() => setActiveNav('analytics')}>Full Analytics</button>
          </SectionHeader>
          {revData.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'var(--text-m)', fontSize:12 }}>
              {loadingStats ? 'Loading...' : 'No revenue data yet'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <ComposedChart data={revData} margin={{top:5,right:5,left:-20,bottom:0}}>
                <defs>
                  <linearGradient id="dash_rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#e8521a" stopOpacity={.35}/>
                    <stop offset="95%" stopColor="#e8521a" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="dash_pos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b8ef8" stopOpacity={.25}/>
                    <stop offset="95%" stopColor="#3b8ef8" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
                <XAxis dataKey="date" tick={{fontSize:9,fill:'var(--text-m)'}} tickLine={false} axisLine={false} interval={4}/>
                <YAxis tick={{fontSize:9,fill:'var(--text-m)'}} tickLine={false} axisLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}k`}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="revenue"    name="Revenue"     stroke="#e8521a" strokeWidth={2}   fill="url(#dash_rg)"  dot={false}/>
                <Area type="monotone" dataKey="posRevenue" name="POS Revenue" stroke="#3b8ef8" strokeWidth={1.5} fill="url(#dash_pos)" dot={false}/>
                <Bar  dataKey="orders" name="Orders" fill="#3b8ef8" opacity={.3} radius={[2,2,0,0]}/>
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card fade-up" style={{ animationDelay:'240ms' }}>
          <SectionHeader title="Order Sources" sub="Today's channel breakdown"/>
          {sourceBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={sourceBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3} dataKey="value">
                    {sourceBreakdown.map((s,i) => <Cell key={i} fill={s.color}/>)}
                  </Pie>
                  <Tooltip contentStyle={{background:'var(--bg-2)',border:'1px solid var(--border-l)',borderRadius:'var(--r)',fontSize:11}}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:4 }}>
                {sourceBreakdown.map(s => (
                  <div key={s.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                      <span style={{ width:8, height:8, borderRadius:'50%', background:s.color, display:'inline-block' }}/>
                      <span style={{ fontSize:11, color:'var(--text-s)' }}>{s.name}</span>
                    </div>
                    <span style={{ fontSize:12, fontWeight:700 }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text-m)', fontSize:12 }}>No orders today yet</div>
          )}
        </div>
      </div>

      {/* Live Orders + Top Products */}
      <div className="grid2">
        <div className="card fade-up" style={{ animationDelay:'280ms' }}>
          <SectionHeader title="Live Orders" sub={`${liveOrders.length} active`}>
            <LiveDot color="var(--green)"/>
            <span style={{fontSize:11,color:'var(--green)',fontWeight:700}}>Real-time</span>
            <button className="btn btn-ghost" style={{fontSize:11}} onClick={() => setActiveNav('orders')}>View All</button>
          </SectionHeader>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {liveOrders.length === 0 && (
              <div style={{ textAlign:'center', padding:'30px 0', color:'var(--text-m)', fontSize:12 }}>No live orders right now</div>
            )}
            {liveOrders.map(o => {
              const sc      = STATUS_COLORS[o.status] || 'var(--text-m)';
              const elapsed = Math.round((Date.now() - new Date(o.createdAt)) / 60000);
              const isLate  = elapsed > 20;
              return (
                <div key={o.id} onClick={() => setActiveNav('orders')}
                  style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', background: isLate ? 'var(--red-soft)' : 'var(--elevated)', borderRadius:'var(--r)', border:`1px solid ${isLate ? 'rgba(245,61,92,.44)' : 'var(--border)'}`, cursor:'pointer', transition:'.15s' }}>
                  <span style={{ width:7, height:7, borderRadius:'50%', background:sc, flexShrink:0, boxShadow:`0 0 8px ${sc}` }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:11 }}>{String(o.id).slice(-8)}</span>
                      <span style={{ fontSize:9, background:'var(--elevated)', color:'var(--text-m)', padding:'1px 6px', borderRadius:99, fontWeight:700, border:'1px solid var(--border)' }}>{SOURCE_LABELS[o.source]||o.source}</span>
                    </div>
                    <div style={{ fontSize:10, color:'var(--text-m)', marginTop:1 }}>{o.customerName}</div>
                  </div>
                  <div style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:12, fontWeight:700 }}>{fmt(o.total)}</div>
                    <div style={{ fontSize:10, color: isLate ? 'var(--red)' : 'var(--text-m)', fontWeight:700 }}>{elapsed}m</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card fade-up" style={{ animationDelay:'320ms' }}>
          <SectionHeader title="Top Products" sub="By units sold"/>
          {topProducts.length === 0 ? (
            <div style={{ textAlign:'center', padding:'30px 0', color:'var(--text-m)', fontSize:12 }}>No sales data yet</div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {topProducts.map((p, i) => (
                <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:'var(--elevated)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:11, color:COLORS[i], border:'1px solid var(--border)', flexShrink:0 }}>{p.name?.slice(0,2)||'?'}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                      <span style={{ fontSize:12, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</span>
                      <span style={{ fontSize:12, fontWeight:800, color:COLORS[i] }}>{p.sold||0}</span>
                    </div>
                    <div className="progress"><div className="progress-fill" style={{ width:`${((p.sold||0)/maxSold)*100}%`, background:`linear-gradient(90deg,${COLORS[i]},${COLORS[i]}88)` }}/></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Branch Performance Matrix */}
      <div className="card fade-up" style={{ animationDelay:'360ms', padding:0, overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:14, fontWeight:700 }}>
              Branch Performance Matrix
              {activeBranchName && <span style={{ fontSize:11, color:'var(--accent)', fontWeight:700, marginLeft:8 }}>· {activeBranchName}</span>}
            </div>
            <div style={{ fontSize:11, color:'var(--text-m)', marginTop:1 }}>Last 30 days</div>
          </div>
          <button className="btn btn-ghost" style={{fontSize:11}} onClick={() => setActiveNav('branches')}>Manage</button>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table className="table">
            <thead>
              <tr><th>Branch</th><th>Status</th><th>Revenue (30d)</th><th>Orders (30d)</th><th>POS</th><th>Rating</th><th>Staff</th><th>Health</th></tr>
            </thead>
            <tbody>
              {branchPerf.map(b => {
                const hc = b.health > 80 ? 'var(--green)' : b.health > 60 ? 'var(--yellow)' : 'var(--red)';
                return (
                  <tr key={b.id}>
                    <td><div style={{fontWeight:700}}>{b.name}</div><div style={{fontSize:10,color:'var(--text-m)'}}>{b.city}</div></td>
                    <td><span className={`badge badge-${b.status==='open'?'green':b.status==='maintenance'?'yellow':'red'}`}>{b.status==='open'&&<LiveDot color="var(--green)" size={6}/>} {b.status}</span></td>
                    <td><span style={{fontFamily:"'JetBrains Mono',monospace",fontWeight:700,fontSize:13}}>{fmt(b.mtdRevenue)}</span></td>
                    <td>{b.mtdOrders?.toLocaleString()}</td>
                    <td>{b.posEnabled ? <span className="badge badge-blue">On</span> : <span className="badge badge-gray">Off</span>}</td>
                    <td><span style={{color:'var(--yellow)'}}>★</span> {b.rating || '—'}</td>
                    <td>{b.staffCount}</td>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div className="progress" style={{width:56}}><div className="progress-fill" style={{width:`${b.health}%`,background:hc}}/></div>
                        <span style={{fontSize:11,fontWeight:800,color:hc}}>{b.health}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card fade-up" style={{ animationDelay:'400ms' }}>
        <SectionHeader title="Recent Activity" sub="Latest events"/>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {recentActivity.length === 0 && (
            <div style={{ textAlign:'center', padding:'20px 0', color:'var(--text-m)', fontSize:12 }}>No recent activity</div>
          )}
          {recentActivity.map(o => {
            const sc      = STATUS_COLORS[o.status] || 'var(--text-m)';
            const elapsed = Math.round((Date.now() - new Date(o.createdAt)) / 60000);
            return (
              <div key={o.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:sc, flexShrink:0 }}/>
                <div style={{ flex:1 }}>
                  <span style={{ fontWeight:600, fontSize:12 }}>{String(o.id).slice(-8)}</span>
                  <span style={{ fontSize:12, color:'var(--text-m)', marginLeft:8 }}>{o.customerName}</span>
                  <span style={{ fontSize:11, color:'var(--text-m)', marginLeft:8 }}>via {SOURCE_LABELS[o.source]||o.source}</span>
                </div>
                <span style={{ fontSize:11, background:`${sc}22`, color:sc, padding:'2px 8px', borderRadius:99, fontWeight:700, textTransform:'capitalize' }}>{o.status}</span>
                <span style={{ fontSize:11, color:'var(--text-m)', minWidth:40, textAlign:'right' }}>{elapsed}m ago</span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
