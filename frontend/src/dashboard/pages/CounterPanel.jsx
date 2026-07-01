import React, { useMemo, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { fmt, SectionHeader, LiveDot, Modal, orderCustomerName, orderSubtitle } from '../components/ui';
import { SOURCE_LABELS, PAYMENT_LABELS } from '../data/mockData';

export default function CounterPanel() {
  const { getPendingConfirmOrders, acceptOrder, rejectOrder, incrementCallAttempt, orderList, activeBranchId, branchList } = useApp();
  const pending = getPendingConfirmOrders();
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [tab, setTab] = useState('pending');

  // All orders for this branch (today)
  const todayOrders = useMemo(() => {
    const today = new Date().toDateString();
    return orderList.filter(o => {
      if (activeBranchId && o.branchId !== activeBranchId) return false;
      return new Date(o.createdAt).toDateString() === today;
    }).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
  }, [orderList, activeBranchId]);

  const acceptedToday = todayOrders.filter(o=>['confirmed','preparing','ready','delivered'].includes(o.status));
  const rejectedToday = todayOrders.filter(o=>o.status==='cancelled');
  const todayRevenue  = acceptedToday.reduce((s,o)=>s+o.total,0);

  const branchName = activeBranchId ? branchList.find(b=>b.id===activeBranchId)?.name : 'All Branches';

  return (
    <div className="page-content">
      <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap', justifyContent:'space-between' }}>
        <div>
          <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:18 }}>Counter Panel</h2>
          <p style={{ fontSize:12, color:'var(--text-m)', marginTop:2 }}>{branchName} · Confirm incoming COD orders</p>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <div style={{ background:'var(--accent-soft)', border:'1px solid rgba(232,82,26,.44)', borderRadius:99, padding:'4px 14px', fontSize:12, fontWeight:800, color:'var(--accent)' }}>
            {pending.length} COD Pending
          </div>
          <div style={{ background:'var(--green-soft)', border:'1px solid rgba(16,217,126,.33)', borderRadius:99, padding:'4px 14px', fontSize:12, fontWeight:800, color:'var(--green)' }}>
            {acceptedToday.length} Accepted Today
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4">
        {[
          { l:'Pending COD', v:pending.length, c:'var(--accent)' },
          { l:'Accepted Today', v:acceptedToday.length, c:'var(--green)' },
          { l:'Rejected Today', v:rejectedToday.length, c:'var(--red)' },
          { l:"Today's Revenue", v:fmt(todayRevenue), c:'var(--blue)' },
        ].map(s=>(
          <div key={s.l} className="card" style={{ padding:'14px 16px' }}>
            <div style={{ fontSize:20, fontWeight:900, color:s.c, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{s.v}</div>
            <div style={{ fontSize:11, color:'var(--text-m)', marginTop:2, fontWeight:600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:6 }}>
        <button className={`tab ${tab==='pending'?'active':''}`} onClick={()=>setTab('pending')}>Pending COD ({pending.length})</button>
        <button className={`tab ${tab==='today'?'active':''}`} onClick={()=>setTab('today')}>All Today ({todayOrders.length})</button>
      </div>

      {tab==='pending' && (
        <>
          {pending.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 24px' }}>
              <div style={{ width:64, height:64, background:'var(--green-soft)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
              </div>
              <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:18, fontWeight:800, marginBottom:8 }}>All Clear</div>
              <div style={{ fontSize:13, color:'var(--text-m)' }}>No pending COD orders to confirm right now.</div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              {pending.map((o,i)=>(
                <div key={o.id} className="card fade-up" style={{ animationDelay:`${i*60}ms`, borderLeft:'3px solid var(--accent)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:12, marginBottom:14 }}>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                        <span style={{ fontWeight:800, fontSize:16, color:'var(--accent)' }}>{orderCustomerName(o)}</span>
                        <div style={{ fontSize:11, color:'var(--text-m)', marginTop:2 }}>{orderSubtitle(o)}</div>
                        <span className="badge badge-orange">{SOURCE_LABELS[o.source]||o.source}</span>
                        {o.callAttempts > 0 && <span className="badge badge-blue">{o.callAttempts} call{o.callAttempts>1?'s':''}</span>}
                        <span className={`badge badge-${o.confirmStatus==='pending_call'?'yellow':o.confirmStatus==='no_answer'?'red':'blue'}`}>
                          {(o.confirmStatus||'pending').replace(/_/g,' ')}
                        </span>
                      </div>
                      <div style={{ fontSize:15, fontWeight:700, marginTop:8 }}>{o.customerName}</div>
                      <div style={{ fontSize:12, color:'var(--text-m)', marginTop:2 }}>{o.customerPhone}</div>
                      {o.customerAddress && <div style={{ fontSize:12, color:'var(--text-m)' }}>{o.customerAddress}</div>}
                      {o.note && (
                        <div style={{ fontSize:11, color:'var(--yellow)', background:'var(--yellow-soft)', padding:'5px 10px', borderRadius:'var(--r)', marginTop:8, display:'inline-block', border:'1px solid rgba(234,179,8,.25)' }}>
                          Note: {o.note}
                        </div>
                      )}
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:24, fontWeight:900 }}>{fmt(o.total)}</div>
                      <div style={{ fontSize:11, color:'var(--text-m)' }}>{PAYMENT_LABELS[o.paymentMethod]||o.paymentMethod}</div>
                      <div style={{ fontSize:10, color:'var(--text-m)', marginTop:2 }}>{o.items?.length||0} item{o.items?.length!==1?'s':''}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:14, padding:'10px 12px', background:'var(--elevated)', borderRadius:'var(--r)' }}>
                    {o.items?.map((item,j)=>(
                      <div key={j} style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                        <span style={{ color:'var(--text-s)' }}>{item.qty}x {item.name}</span>
                        <span style={{ fontWeight:700 }}>{fmt(item.total)}</span>
                      </div>
                    ))}
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, paddingTop:6, borderTop:'1px solid var(--border)', marginTop:4 }}>
                      <span style={{ color:'var(--text-m)' }}>Tax ({Math.round((o.tax/o.subtotal)*100||0)}%)</span>
                      <span>{fmt(o.tax)}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <button className="btn btn-primary" style={{ flex:1, justifyContent:'center', minWidth:120 }} onClick={()=>acceptOrder(o.id)}>
                      Accept Order
                    </button>
                    <button className="btn btn-ghost" style={{ flex:1, justifyContent:'center', minWidth:120 }} onClick={()=>incrementCallAttempt(o.id)}>
                      Log Call{o.callAttempts>0?` (${o.callAttempts}x)`:''}
                    </button>
                    <button className="btn btn-danger" style={{ flex:1, justifyContent:'center', minWidth:120 }} onClick={()=>setRejectModal(o.id)}>
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab==='today' && (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <table className="table">
            <thead>
              <tr><th>Customer</th><th>Source</th><th>Total</th><th>Payment</th><th>Status</th><th>Time</th></tr>
            </thead>
            <tbody>
              {todayOrders.map(o=>(
                <tr key={o.id}>
                  <td>
                    <div style={{ fontWeight:600 }}>{orderCustomerName(o)}</div>
                    <div style={{ fontSize:10, color:'var(--text-m)' }}>{orderSubtitle(o)}</div>
                  </td>
                  <td><span style={{ fontSize:11, color:'var(--text-s)' }}>{SOURCE_LABELS[o.source]||o.source}</span></td>
                  <td style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:12 }}>{fmt(o.total)}</td>
                  <td style={{ fontSize:11, color:'var(--text-m)' }}>{PAYMENT_LABELS[o.paymentMethod]||o.paymentMethod}</td>
                  <td>
                    <span className={`badge badge-${o.status==='delivered'||o.status==='confirmed'?'green':o.status==='cancelled'?'red':o.status==='preparing'?'orange':'yellow'}`} style={{ textTransform:'capitalize' }}>
                      {o.status}
                    </span>
                  </td>
                  <td style={{ fontSize:11, color:'var(--text-m)' }}>
                    {new Date(o.createdAt).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {todayOrders.length===0 && <div style={{ textAlign:'center', padding:'50px', color:'var(--text-m)', fontSize:13 }}>No orders today yet.</div>}
        </div>
      )}

      {rejectModal && (
        <Modal title="Reject Order" onClose={()=>setRejectModal(null)}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ fontSize:13 }}>Please select a reason for rejecting order <strong>{rejectModal}</strong>:</div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Rejection Reason</div>
              <select className="input" value={rejectReason} onChange={e=>setRejectReason(e.target.value)}>
                <option value="">Select reason...</option>
                <option>Customer unreachable after 3 attempts</option>
                <option>Out of delivery area</option>
                <option>Item unavailable</option>
                <option>Branch is closed</option>
                <option>Duplicate order</option>
                <option>Customer cancelled</option>
                <option>Incorrect order details</option>
              </select>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-danger" style={{ flex:1, justifyContent:'center' }} onClick={()=>{ rejectOrder(rejectModal, rejectReason); setRejectModal(null); setRejectReason(''); }}>Confirm Reject</button>
              <button className="btn btn-ghost" onClick={()=>setRejectModal(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
