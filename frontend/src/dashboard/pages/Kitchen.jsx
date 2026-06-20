import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { SectionHeader, LiveDot } from '../components/ui';
import { SOURCE_LABELS } from '../data/mockData';

const KITCHEN_STATUSES = ['confirmed', 'preparing', 'ready'];

export default function Kitchen() {
  const { orderList, updateOrderStatus, activeBranchId } = useApp();
  const [filter, setFilter] = useState('all');

  const kitchenOrders = useMemo(() => {
    return orderList.filter(o => {
      if (activeBranchId && o.branchId !== activeBranchId) return false;
      if (!KITCHEN_STATUSES.includes(o.status)) return false;
      if (filter !== 'all' && o.status !== filter) return false;
      return true;
    }).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
  }, [orderList, activeBranchId, filter]);

  const counts = useMemo(() => KITCHEN_STATUSES.reduce((a,s) => ({...a,[s]:orderList.filter(o=>o.status===s&&(!activeBranchId||o.branchId===activeBranchId)).length}), {}), [orderList, activeBranchId]);

  const advance = (o) => {
    const next = { confirmed:'preparing', preparing:'ready', ready:'delivered' }[o.status];
    if (next) updateOrderStatus(o.id, next);
  };

  const getElapsed = (createdAt) => Math.round((Date.now() - new Date(createdAt)) / 60000);

  const STATUS_CONFIG = {
    confirmed: { label:'To Prepare', color:'var(--blue)',   next:'Start Preparing', bg:'rgba(59,142,248,.1)' },
    preparing: { label:'Preparing',  color:'var(--accent)', next:'Mark Ready',      bg:'rgba(232,82,26,.1)'  },
    ready:     { label:'Ready',      color:'var(--green)',  next:'Deliver',         bg:'rgba(16,217,126,.1)' },
  };

  return (
    <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20, height:'100%' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:18 }}>Kitchen Display</h2>
          <LiveDot color="var(--green)"/>
          <span style={{ fontSize:12, fontWeight:700, color:'var(--green)' }}>Live</span>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {['all',...KITCHEN_STATUSES].map(s => (
            <button key={s} onClick={()=>setFilter(s)} className={`tab ${filter===s?'active':''}`} style={{ textTransform:'capitalize', fontSize:11 }}>
              {s === 'all' ? `All (${kitchenOrders.length})` : `${STATUS_CONFIG[s]?.label} (${counts[s]||0})`}
            </button>
          ))}
        </div>
      </div>

      {kitchenOrders.length === 0 ? (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:16 }}>
          <div style={{ width:64, height:64, background:'var(--green-soft)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2"><polyline points="20,6 9,17 4,12"/></svg>
          </div>
          <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:18, fontWeight:800 }}>Kitchen Clear</div>
          <div style={{ fontSize:13, color:'var(--text-m)' }}>No active orders in the kitchen.</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, alignItems:'start' }}>
          {KITCHEN_STATUSES.map(status => {
            const statusOrders = kitchenOrders.filter(o => o.status === status && (filter === 'all' || filter === status));
            const cfg = STATUS_CONFIG[status];
            return (
              <div key={status}>
                <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:13, color:cfg.color, marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ width:8, height:8, borderRadius:'50%', background:cfg.color }}/>
                  {cfg.label} ({statusOrders.length})
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {statusOrders.map(o => {
                    const elapsed = getElapsed(o.createdAt);
                    const isLate  = elapsed > 15;
                    return (
                      <div key={o.id} style={{ background:isLate?'var(--red-soft)':cfg.bg, border:`1px solid ${isLate?'rgba(245,61,92,.44)':cfg.color+'33'}`, borderRadius:'var(--r)', padding:14 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                          <div>
                            <div style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:800, fontSize:14, color:cfg.color }}>{o.id}</div>
                            <div style={{ fontSize:11, color:'var(--text-m)', marginTop:2 }}>{SOURCE_LABELS[o.source]||o.source} · {o.customerName}</div>
                            {o.tableNo && <div style={{ fontSize:11, fontWeight:700, marginTop:2 }}>Table {o.tableNo}</div>}
                          </div>
                          <div style={{ textAlign:'right' }}>
                            <div style={{ fontSize:22, fontWeight:900, color:isLate?'var(--red)':cfg.color, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{elapsed}m</div>
                            <div style={{ fontSize:10, color:'var(--text-m)' }}>elapsed</div>
                          </div>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:12 }}>
                          {(o.items||[]).map((item,i)=>(
                            <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:12, padding:'5px 8px', background:'rgba(255,255,255,.06)', borderRadius:6 }}>
                              <span style={{ fontWeight:600 }}>{item.qty}× {item.name}</span>
                            </div>
                          ))}
                        </div>
                        {o.note && (
                          <div style={{ fontSize:11, color:'var(--yellow)', padding:'5px 8px', background:'var(--yellow-soft)', borderRadius:6, marginBottom:10, border:'1px solid rgba(234,179,8,.2)' }}>
                            {o.note}
                          </div>
                        )}
                        <button
                          style={{ width:'100%', padding:'9px', borderRadius:'var(--r)', background:cfg.color, color:'#fff', border:'none', cursor:'pointer', fontWeight:700, fontSize:12, transition:'.15s' }}
                          onMouseEnter={e=>e.currentTarget.style.opacity='.85'}
                          onMouseLeave={e=>e.currentTarget.style.opacity='1'}
                          onClick={()=>advance(o)}>
                          {cfg.next}
                        </button>
                      </div>
                    );
                  })}
                  {statusOrders.length === 0 && (
                    <div style={{ textAlign:'center', padding:'30px 16px', color:'var(--text-m)', fontSize:12, background:'var(--elevated)', borderRadius:'var(--r)', border:'1px dashed var(--border)' }}>
                      Nothing in {cfg.label.toLowerCase()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
