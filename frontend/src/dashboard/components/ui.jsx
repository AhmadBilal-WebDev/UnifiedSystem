import React from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

export const fmt = (v) => `PKR ${(v||0).toLocaleString('en-PK')}`;

/** Customer-facing order label — never show raw MongoDB ids in the UI */
export const orderCustomerName = (order) =>
  order?.customerName?.trim() || order?.customerPhone || 'Walk-in Customer';

export const orderSubtitle = (order) => {
  const time = order?.createdAt
    ? new Date(order.createdAt).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
    : '';
  const count = order?.items?.length || 0;
  return [time, `${count} item${count === 1 ? '' : 's'}`].filter(Boolean).join(' · ');
};

export const STATUS_STYLE = {
  pending:   { label:'Pending',   color:'var(--yellow)', bg:'rgba(234,179,8,.15)' },
  confirmed: { label:'Confirmed', color:'var(--blue)',   bg:'rgba(59,142,248,.15)' },
  preparing: { label:'Preparing', color:'var(--accent)', bg:'rgba(232,82,26,.15)' },
  ready:     { label:'Ready',     color:'var(--green)',  bg:'rgba(16,217,126,.15)' },
  delivered: { label:'Delivered', color:'var(--text-s)', bg:'rgba(255,255,255,.08)' },
  cancelled: { label:'Cancelled', color:'var(--red)',    bg:'rgba(245,61,92,.15)'  },
};

export function MetricCard({ label, value, sub, icon, color, trend, sparkData, delay=0, badge }) {
  return (
    <div className="card fade-up" style={{ animationDelay:`${delay}ms`, display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div style={{ width:38, height:38, borderRadius:10, background:`${color}1a`, display:'flex', alignItems:'center', justifyContent:'center', color, flexShrink:0 }}>
          {icon}
        </div>
        <div style={{ display:'flex', gap:5, alignItems:'center' }}>
          {badge && <span className={`badge badge-${badge.c}`}>{badge.t}</span>}
          {trend !== undefined && (
            <span style={{ fontSize:10, fontWeight:700, color: trend >= 0 ? 'var(--green)' : 'var(--red)' }}>
              {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
      <div>
        <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:900, fontSize:22, letterSpacing:'-.03em', lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:11, color:'var(--text-m)', marginTop:3, fontWeight:600 }}>{label}</div>
        {sub && <div style={{ fontSize:10, color:'var(--text-m)', marginTop:2 }}>{sub}</div>}
      </div>
      {sparkData && sparkData.length > 0 && (
        <div style={{ height:40, marginTop:-4 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top:0, right:0, left:0, bottom:0 }}>
              <defs>
                <linearGradient id={`sg_${label.replace(/\s/g,'')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={.3}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="revenue" stroke={color} strokeWidth={1.5} fill={`url(#sg_${label.replace(/\s/g,'')})`} dot={false}/>
              <Tooltip content={() => null}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export function SectionHeader({ title, sub, children }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, flexWrap:'wrap', gap:8 }}>
      <div>
        <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:14 }}>{title}</div>
        {sub && <div style={{ fontSize:11, color:'var(--text-m)', marginTop:2 }}>{sub}</div>}
      </div>
      {children && (
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>{children}</div>
      )}
    </div>
  );
}

export function LiveDot({ color = 'var(--green)', size = 8 }) {
  return (
    <span style={{ position:'relative', display:'inline-flex', alignItems:'center', justifyContent:'center', width:size, height:size, flexShrink:0 }}>
      <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:color, opacity:.5, animation:'ping 1.4s ease-in-out infinite' }}/>
      <span style={{ width:size, height:size, borderRadius:'50%', background:color, display:'inline-block' }}/>
    </span>
  );
}

export function Modal({ title, onClose, children, maxWidth = 520 }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content fade-in" style={{ maxWidth }} onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:16 }}>{title}</div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:'var(--r)', background:'var(--elevated)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:'var(--text-m)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'var(--bg-2)', border:'1px solid var(--border-l)', borderRadius:'var(--r)', padding:'10px 14px', fontSize:11 }}>
      <div style={{ fontWeight:700, marginBottom:6, color:'var(--text-s)' }}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} style={{ display:'flex', gap:8, marginBottom:2 }}>
          <span style={{ color:p.color, fontWeight:700 }}>{p.name}:</span>
          <span style={{ fontWeight:600 }}>{typeof p.value === 'number' && p.value > 1000 ? fmt(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
}
