import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, ComposedChart, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useApp } from '../contexts/AppContext';
import { fmt, SectionHeader, CustomTooltip } from '../components/ui';
import { SOURCE_LABELS, SOURCE_COLORS } from '../data/mockData';
import api from '../services/api';

export default function Analytics() {
  const { orderList, getClientBranches, getClientProducts, activeBranchId } = useApp();
  const [range, setRange] = useState(30);
  const [branchFilter, setBranchFilter] = useState(activeBranchId || 'all');
  const branches = getClientBranches();
  const products  = getClientProducts();

  const [revData, setRevData] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoadingChart(true);
    const params = { days: range };
    if (branchFilter !== 'all') params.branchId = branchFilter;
    api.dashboard.getRevenueChart(params)
      .then(res => { if (!cancelled) setRevData(res.data || []); })
      .catch(() => { if (!cancelled) setRevData([]); })
      .finally(() => { if (!cancelled) setLoadingChart(false); });
    return () => { cancelled = true; };
  }, [branchFilter, range]);

  const filteredOrders = useMemo(() => {
    const cutoff = new Date(Date.now() - range * 86400000);
    return orderList.filter(o => {
      if (branchFilter !== 'all' && o.branchId !== branchFilter) return false;
      return new Date(o.createdAt) >= cutoff;
    });
  }, [orderList, branchFilter, range]);

  const totalRevenue   = filteredOrders.reduce((s,o) => s+o.total, 0);
  const totalOrders    = filteredOrders.length;
  const avgOrderValue  = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
  const deliveredOrders= filteredOrders.filter(o => o.status === 'delivered').length;
  const completionRate = totalOrders ? Math.round((deliveredOrders / totalOrders) * 100) : 0;

  // Source breakdown
  const sourceData = Object.entries(SOURCE_LABELS).map(([k, label]) => {
    const src = filteredOrders.filter(o => o.source === k);
    return { name: label, orders: src.length, revenue: src.reduce((s,o)=>s+o.total,0), color: SOURCE_COLORS[k] };
  }).filter(x => x.orders > 0).sort((a,b) => b.revenue - a.revenue);

  // Branch comparison
  const branchData = branches.map(b => {
    const bOrders = filteredOrders.filter(o => o.branchId === b.id);
    return {
      name: b.name.split(' ')[0],
      revenue: bOrders.reduce((s,o)=>s+o.total,0),
      orders:  bOrders.length,
      pos:     bOrders.filter(o=>o.source==='pos').reduce((s,o)=>s+o.total,0),
    };
  });

  // Hourly pattern
  const hourlyData = Array.from({length:24},(_,h) => {
    const hOrders = filteredOrders.filter(o => new Date(o.createdAt).getHours() === h);
    return { hour:`${String(h).padStart(2,'0')}:00`, orders: hOrders.length, revenue: hOrders.reduce((s,o)=>s+o.total,0) };
  });

  // Top products
  const productSales = products.map(p => ({
    name: p.name.length > 20 ? p.name.slice(0,18)+'…' : p.name,
    sold: p.sold || 0,
    revenue: (p.sold||0) * p.price,
    margin: p.cost>0 ? Math.round(((p.price-p.cost)/p.price)*100) : 0,
  })).sort((a,b) => b.revenue - a.revenue).slice(0, 8);

  // Status breakdown
  const statusData = [
    { name:'Delivered', value: filteredOrders.filter(o=>o.status==='delivered').length, color:'var(--green)' },
    { name:'Cancelled', value: filteredOrders.filter(o=>o.status==='cancelled').length, color:'var(--red)' },
    { name:'In Progress', value: filteredOrders.filter(o=>['pending','confirmed','preparing','ready'].includes(o.status)).length, color:'var(--blue)' },
  ];

  const COLORS = ['var(--accent)','var(--blue)','var(--green)','var(--purple)','var(--yellow)','var(--cyan)','var(--red)','var(--orange)'];

  return (
    <div className="page-content">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:18 }}>Analytics</h2>
          <p style={{ fontSize:12, color:'var(--text-m)', marginTop:2 }}>Performance insights for the selected period</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <select className="input" style={{ width:'auto', padding:'6px 10px', fontSize:12 }} value={branchFilter} onChange={e=>setBranchFilter(e.target.value)}>
            <option value="all">All Branches</option>
            {branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          {[7,14,30,60,90].map(d=>(
            <button key={d} onClick={()=>setRange(d)} className={`tab ${range===d?'active':''}`} style={{ fontSize:11 }}>{d}d</button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid-4">
        {[
          { l:'Total Revenue',    v:fmt(totalRevenue),    c:'var(--accent)', sub:`${range} day period` },
          { l:'Total Orders',     v:totalOrders,          c:'var(--blue)',   sub:`${Math.round(totalOrders/range)} avg/day` },
          { l:'Avg Order Value',  v:fmt(avgOrderValue),   c:'var(--green)',  sub:'Per completed order' },
          { l:'Completion Rate',  v:`${completionRate}%`, c:'var(--purple)', sub:`${deliveredOrders} delivered` },
        ].map(s=>(
          <div key={s.l} className="card" style={{ padding:'16px 18px' }}>
            <div style={{ fontSize:24, fontWeight:900, color:s.c, fontFamily:"'Plus Jakarta Sans',sans-serif", letterSpacing:'-.03em' }}>{s.v}</div>
            <div style={{ fontSize:12, fontWeight:700, marginTop:4 }}>{s.l}</div>
            <div style={{ fontSize:11, color:'var(--text-m)', marginTop:2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue Trend */}
      <div className="card">
        <SectionHeader title="Revenue Trend" sub={`Last ${range} days · Total + POS breakdown`}/>
        {revData.length === 0 ? (
          <div style={{ textAlign:'center', padding:'70px 0', color:'var(--text-m)', fontSize:12 }}>
            {loadingChart ? 'Loading...' : 'No revenue data for this period'}
          </div>
        ) : (
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={revData} margin={{top:5,right:10,left:-10,bottom:0}}>
            <defs>
              <linearGradient id="an_rev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--accent)" stopOpacity={.3}/>
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="an_pos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--blue)" stopOpacity={.25}/>
                <stop offset="95%" stopColor="var(--blue)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="an_onl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--green)" stopOpacity={.2}/>
                <stop offset="95%" stopColor="var(--green)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
            <XAxis dataKey="date" tick={{fontSize:9,fill:'var(--text-m)'}} tickLine={false} axisLine={false} interval={Math.floor(range/7)}/>
            <YAxis tick={{fontSize:9,fill:'var(--text-m)'}} tickLine={false} axisLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
            <Tooltip content={<CustomTooltip/>}/>
            <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:11}}/>
            <Area type="monotone" dataKey="revenue"       name="Total Revenue"   stroke="var(--accent)" strokeWidth={2}   fill="url(#an_rev)" dot={false}/>
            <Area type="monotone" dataKey="posRevenue"    name="POS Revenue"     stroke="var(--blue)"   strokeWidth={1.5} fill="url(#an_pos)" dot={false}/>
            <Area type="monotone" dataKey="onlineRevenue" name="Online Revenue"  stroke="var(--green)"  strokeWidth={1.5} fill="url(#an_onl)" dot={false}/>
            <Bar  dataKey="orders" name="Orders" fill="var(--blue)" opacity={.25} radius={[2,2,0,0]} yAxisId={1}/>
          </ComposedChart>
        </ResponsiveContainer>
        )}
      </div>

      {/* Branch Comparison + Source Mix */}
      <div className="grid2">
        <div className="card">
          <SectionHeader title="Branch Revenue" sub="Comparison across all branches"/>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={branchData} margin={{top:5,right:5,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="name" tick={{fontSize:10,fill:'var(--text-m)'}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fontSize:9,fill:'var(--text-m)'}} tickLine={false} axisLine={false} tickFormatter={v=>`${(v/1000).toFixed(0)}k`}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:11}}/>
              <Bar dataKey="revenue" name="Total Revenue" fill="var(--accent)" radius={[4,4,0,0]} opacity={.85}/>
              <Bar dataKey="pos"     name="POS Revenue"   fill="var(--blue)"   radius={[4,4,0,0]} opacity={.7}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <SectionHeader title="Order Channel Mix" sub="Revenue by source"/>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={sourceData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="revenue">
                {sourceData.map((s,i)=><Cell key={i} fill={s.color || COLORS[i % COLORS.length]}/>)}
              </Pie>
              <Tooltip contentStyle={{background:'var(--bg-2)',border:'1px solid var(--border-l)',borderRadius:'var(--r)',fontSize:11}} formatter={(v)=>[fmt(v),'Revenue']}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {sourceData.map(s=>(
              <div key={s.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:s.color, display:'inline-block' }}/>
                  <span style={{ fontSize:11, color:'var(--text-s)' }}>{s.name}</span>
                </div>
                <div style={{ display:'flex', gap:12 }}>
                  <span style={{ fontSize:11, color:'var(--text-m)' }}>{s.orders} orders</span>
                  <span style={{ fontSize:12, fontWeight:700 }}>{fmt(s.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Pattern + Order Status */}
      <div className="grid2">
        <div className="card">
          <SectionHeader title="Hourly Order Pattern" sub="Orders by hour of day"/>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={hourlyData} margin={{top:5,right:5,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false}/>
              <XAxis dataKey="hour" tick={{fontSize:8,fill:'var(--text-m)'}} tickLine={false} axisLine={false} interval={3}/>
              <YAxis tick={{fontSize:9,fill:'var(--text-m)'}} tickLine={false} axisLine={false}/>
              <Tooltip content={<CustomTooltip/>}/>
              <Bar dataKey="orders" name="Orders" fill="var(--accent)" radius={[3,3,0,0]} opacity={.85}/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <SectionHeader title="Order Status" sub="Outcome breakdown"/>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                {statusData.map((s,i)=><Cell key={i} fill={s.color}/>)}
              </Pie>
              <Tooltip contentStyle={{background:'var(--bg-2)',border:'1px solid var(--border-l)',borderRadius:'var(--r)',fontSize:11}}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:'flex', gap:16, justifyContent:'center' }}>
            {statusData.map(s=>(
              <div key={s.name} style={{ textAlign:'center' }}>
                <div style={{ fontSize:18, fontWeight:900, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:10, color:'var(--text-m)' }}>{s.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products Table */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)' }}>
          <SectionHeader title="Top Products by Revenue" sub="Based on sold units × price"/>
        </div>
        <table className="table">
          <thead>
            <tr><th>#</th><th>Product</th><th>Units Sold</th><th>Revenue</th><th>Margin</th><th>Performance</th></tr>
          </thead>
          <tbody>
            {productSales.map((p,i)=>(
              <tr key={p.name}>
                <td style={{ fontWeight:900, color:'var(--text-m)', fontSize:13 }}>{i+1}</td>
                <td style={{ fontWeight:700 }}>{p.name}</td>
                <td style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{p.sold}</td>
                <td style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{fmt(p.revenue)}</td>
                <td>
                  <span style={{ fontWeight:700, color: p.margin>60?'var(--green)':p.margin>40?'var(--yellow)':'var(--red)' }}>
                    {p.margin}%
                  </span>
                </td>
                <td>
                  <div className="progress" style={{ width:100 }}>
                    <div className="progress-fill" style={{ width:`${Math.round((p.revenue/productSales[0].revenue)*100)}%`, background:COLORS[i%COLORS.length] }}/>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
