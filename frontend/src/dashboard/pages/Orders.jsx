import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { fmt, STATUS_STYLE, SectionHeader, Modal, orderCustomerName, orderSubtitle } from '../components/ui';
import { SOURCE_LABELS, SOURCE_COLORS, ORDER_TYPE_LABELS, PAYMENT_LABELS } from '../data/mockData';

export default function Orders() {
  const {
    orderList, updateOrderStatus, acceptOrder, rejectOrder,
    getAccessibleBranches, activeBranchId, branchList, addOrder,
    highlightOrderId, setHighlightOrderId, getFilteredOrders,
  } = useApp();

  const [filter,        setFilter       ] = useState('all');
  const [search,        setSearch       ] = useState('');
  const [sourceFilter,  setSourceFilter ] = useState('all');
  const [typeFilter,    setTypeFilter   ] = useState('all');
  const [branchFilter,  setBranchFilter ] = useState('all');
  const [showNewOrder,  setShowNewOrder ] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectReason,  setRejectReason ] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [newOrder, setNewOrder] = useState({
    customerName:'', customerPhone:'', source:'counter', type:'dine-in',
    paymentMethod:'card', tableNo:'', note:'', branchId: activeBranchId || '',
  });

  const branches  = getAccessibleBranches();
  const rowRefs   = useRef({});

  // When notification deep-links with a specific order ID, open it
  useEffect(() => {
    if (!highlightOrderId) return;
    const found = orderList.find(o => o.id === highlightOrderId);
    if (found) {
      setSelectedOrder(found);
      setFilter('all');
      // Scroll to highlighted row after short delay for render
      setTimeout(() => {
        const el = rowRefs.current[highlightOrderId];
        if (el) el.scrollIntoView({ behavior:'smooth', block:'center' });
      }, 200);
    }
  }, [highlightOrderId, orderList]);

  const baseOrders = useMemo(() => {
    // Start from branch-filtered list (respects global branch selector)
    const base = getFilteredOrders(branchFilter !== 'all' ? branchFilter : null);
    return base.filter(o => {
      if (filter !== 'all' && o.status !== filter) return false;
      if (sourceFilter !== 'all' && o.source !== sourceFilter) return false;
      if (typeFilter   !== 'all' && o.type   !== typeFilter)   return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !o.customerName?.toLowerCase().includes(q) &&
          !o.customerPhone?.includes(q)
        ) return false;
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [orderList, filter, search, sourceFilter, typeFilter, branchFilter, getFilteredOrders]);

  const counts = useMemo(() =>
    orderList.reduce((a, o) => ({ ...a, [o.status]: (a[o.status]||0) + 1 }), {}),
  [orderList]);

  const advance = id => {
    const o = orderList.find(x => x.id === id);
    if (!o) return;
    const next = { pending:'confirmed', confirmed:'preparing', preparing:'ready', ready:'delivered' }[o.status];
    if (next) updateOrderStatus(id, next);
  };

  const handleNewOrder = () => {
    if (!newOrder.customerName) return;
    addOrder({
      ...newOrder, status:'pending', confirmStatus:null,
      items:[], subtotal:0, tax:0, discount:0, total:0,
      customerAddress:null,
      tableNo: newOrder.tableNo ? parseInt(newOrder.tableNo) : null,
      branchId: newOrder.branchId || activeBranchId,
      clientId: 'c1', rating:null, callAttempts:0,
    });
    setShowNewOrder(false);
    setNewOrder({ customerName:'', customerPhone:'', source:'counter', type:'dine-in', paymentMethod:'card', tableNo:'', note:'', branchId: activeBranchId || '' });
  };

  const sources = [...new Set(orderList.map(o => o.source))];

  return (
    <div className="page-content">

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:18 }}>Order Management</h2>
          <p style={{ fontSize:12, color:'var(--text-m)', marginTop:2 }}>
            {baseOrders.length} shown · {counts.pending||0} pending · {counts.preparing||0} preparing
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNewOrder(true)}>+ New Order</button>
      </div>

      {/* Status summary cards */}
      <div className="grid-5">
        {[
          { s:'pending',   l:'Pending',   c:'var(--yellow)' },
          { s:'confirmed', l:'Confirmed', c:'var(--blue)'   },
          { s:'preparing', l:'Preparing', c:'var(--accent)' },
          { s:'ready',     l:'Ready',     c:'var(--green)'  },
          { s:'delivered', l:'Delivered', c:'var(--text-s)' },
        ].map(x => (
          <div key={x.s}
            onClick={() => setFilter(filter === x.s ? 'all' : x.s)}
            style={{ background: filter === x.s ? 'var(--elevated)' : 'var(--surface)', border:`1px solid ${filter === x.s ? x.c+'55' : 'var(--border)'}`, borderTop: filter === x.s ? `2px solid ${x.c}` : '2px solid transparent', borderRadius:'var(--r)', padding:'12px 14px', cursor:'pointer', transition:'.15s' }}>
            <div style={{ fontSize:22, fontWeight:900, color:x.c, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{counts[x.s]||0}</div>
            <div style={{ fontSize:11, color:'var(--text-s)', fontWeight:600, marginTop:2 }}>{x.l}</div>
          </div>
        ))}
      </div>

      {/* Filters row */}
      <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <input className="input" style={{ maxWidth:220 }} placeholder="Search name, ID, phone…" value={search} onChange={e => setSearch(e.target.value)}/>
        <select className="input" style={{ width:'auto', padding:'6px 10px', fontSize:12 }} value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}>
          <option value="all">All Sources</option>
          {sources.map(s => <option key={s} value={s}>{SOURCE_LABELS[s]||s}</option>)}
        </select>
        <select className="input" style={{ width:'auto', padding:'6px 10px', fontSize:12 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="dine-in">Dine-in</option>
          <option value="takeaway">Takeaway</option>
          <option value="delivery">Delivery</option>
        </select>
        <select className="input" style={{ width:'auto', padding:'6px 10px', fontSize:12 }} value={branchFilter} onChange={e => setBranchFilter(e.target.value)}>
          <option value="all">All Branches</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginLeft:'auto' }}>
          {['all','pending','confirmed','preparing','ready','delivered','cancelled'].map(f => (
            <button key={f} className={`tab ${filter===f?'active':''}`} onClick={() => setFilter(f)} style={{ textTransform:'capitalize', fontSize:11 }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Orders table */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>Customer</th><th>Source</th><th>Type</th>
              <th>Branch</th><th>Items</th><th>Total</th><th>Payment</th>
              <th>Status</th><th>Time</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {baseOrders.slice(0, 80).map(o => {
              const ss         = STATUS_STYLE[o.status] || STATUS_STYLE.pending;
              const canAdv     = ['pending','confirmed','preparing','ready'].includes(o.status);
              const nextLabel  = { pending:'Confirm', confirmed:'Prepare', preparing:'Ready', ready:'Deliver' }[o.status];
              const elapsed    = Math.round((Date.now() - new Date(o.createdAt)) / 60000);
              const srcColor   = SOURCE_COLORS[o.source] || 'var(--text-m)';
              const branchName = branchList.find(b => b.id === o.branchId)?.name || '—';
              const isHighlighted = o.id === highlightOrderId;
              const isSelected    = selectedOrder?.id === o.id;

              return (
                <tr
                  key={o.id}
                  ref={el => rowRefs.current[o.id] = el}
                  onClick={() => { setSelectedOrder(isSelected ? null : o); if (isHighlighted) setHighlightOrderId(null); }}
                  style={{
                    cursor:'pointer',
                    background: isHighlighted ? 'rgba(232,82,26,.08)' : isSelected ? 'var(--elevated)' : undefined,
                    outline: isHighlighted ? '2px solid var(--accent)' : 'none',
                    outlineOffset: -2,
                    transition:'background .2s, outline .2s',
                  }}>
                  <td>
                    <div style={{ fontWeight:600 }}>{orderCustomerName(o)}</div>
                    {o.customerPhone && <div style={{ fontSize:10, color:'var(--text-m)' }}>{o.customerPhone}</div>}
                    <div style={{ fontSize:10, color:'var(--text-m)', marginTop:2 }}>{orderSubtitle(o)}</div>
                    {o.posSync && <span className="badge badge-blue" style={{ marginTop:4, fontSize:9 }}>POS</span>}
                    {isHighlighted && <span className="badge badge-orange" style={{ marginLeft:4, fontSize:9 }}>New</span>}
                  </td>
                  <td>
                    <span style={{ fontSize:11, background:`${srcColor}18`, color:srcColor, padding:'2px 8px', borderRadius:99, fontWeight:700 }}>
                      {SOURCE_LABELS[o.source]||o.source}
                    </span>
                  </td>
                  <td><span className="badge badge-gray" style={{ textTransform:'capitalize' }}>{ORDER_TYPE_LABELS[o.type]||o.type}{o.tableNo ? ` T${o.tableNo}` : ''}</span></td>
                  <td style={{ fontSize:11, color:'var(--text-s)' }}>{branchName}</td>
                  <td style={{ fontWeight:700 }}>{o.items?.length||0}</td>
                  <td style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{fmt(o.total)}</td>
                  <td style={{ fontSize:11, color:'var(--text-m)', textTransform:'capitalize' }}>{PAYMENT_LABELS[o.paymentMethod]||o.paymentMethod||'—'}</td>
                  <td>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5, background:ss.bg, color:ss.color, padding:'3px 9px', borderRadius:99, fontSize:10, fontWeight:800, textTransform:'capitalize' }}>
                      {['pending','preparing','confirmed'].includes(o.status) && <span style={{ width:5, height:5, borderRadius:'50%', background:ss.color, animation:'anim-pulse 1.5s infinite' }}/>}
                      {ss.label}
                    </span>
                  </td>
                  <td style={{ color: elapsed > 20 ? 'var(--red)' : 'var(--text-m)', fontWeight:700, fontSize:12 }}>{elapsed}m</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div style={{ display:'flex', gap:4 }}>
                      {canAdv && <button className="btn btn-ghost" style={{ fontSize:10, padding:'3px 8px' }} onClick={() => advance(o.id)}>{nextLabel}</button>}
                      {o.status === 'pending' && <>
                        <button className="btn btn-ghost" style={{ fontSize:10, padding:'3px 8px', color:'var(--green)', borderColor:'var(--green)' }} onClick={() => acceptOrder(o.id)}>Accept</button>
                        <button className="btn btn-danger" style={{ fontSize:10, padding:'3px 8px' }} onClick={() => setShowRejectModal(o.id)}>Reject</button>
                      </>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {baseOrders.length === 0 && (
          <div style={{ textAlign:'center', padding:'60px 24px', color:'var(--text-m)', fontSize:13 }}>No orders match the current filters.</div>
        )}
      </div>

      {/* ── Order Detail Drawer (click row to open) ── */}
      {selectedOrder && (
        <div className="card fade-up" style={{ borderLeft:`3px solid var(--accent)` }}>
          <SectionHeader
            title={`Order — ${orderCustomerName(selectedOrder)}`}
            sub={`${SOURCE_LABELS[selectedOrder.source]||selectedOrder.source} · ${selectedOrder.customerName} · ${new Date(selectedOrder.createdAt).toLocaleString('en',{dateStyle:'medium',timeStyle:'short'})}`}>
            <button className="btn btn-ghost" style={{ fontSize:11 }} onClick={() => setSelectedOrder(null)}>Close</button>
          </SectionHeader>

          <div className="grid-3" style={{ marginBottom:16 }}>
            {/* Customer block */}
            <div style={{ background:'var(--elevated)', borderRadius:'var(--r)', padding:'14px 16px' }}>
              <div style={{ fontSize:10, fontWeight:800, color:'var(--text-m)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Customer</div>
              <div style={{ fontWeight:700, fontSize:14 }}>{selectedOrder.customerName}</div>
              {selectedOrder.customerPhone && (
                <div style={{ fontSize:12, color:'var(--text-m)', marginTop:4, display:'flex', alignItems:'center', gap:6 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.5a19.79 19.79 0 01-3.07-8.67A2 2 0 012 .7h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 8.37a16 16 0 006.72 6.72l1.06-1.06a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  {selectedOrder.customerPhone}
                </div>
              )}
              {selectedOrder.customerAddress && (
                <div style={{ fontSize:11, color:'var(--text-m)', marginTop:6, lineHeight:1.5 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display:'inline', marginRight:4 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {selectedOrder.customerAddress}
                </div>
              )}
              {selectedOrder.rating && (
                <div style={{ fontSize:12, color:'var(--yellow)', marginTop:8, fontWeight:700 }}>
                  {'★'.repeat(selectedOrder.rating)}{'☆'.repeat(5-selectedOrder.rating)} {selectedOrder.rating}/5
                </div>
              )}
            </div>

            {/* Order info block */}
            <div style={{ background:'var(--elevated)', borderRadius:'var(--r)', padding:'14px 16px' }}>
              <div style={{ fontSize:10, fontWeight:800, color:'var(--text-m)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Order Info</div>
              {[
                { l:'Branch',   v: branchList.find(b=>b.id===selectedOrder.branchId)?.name || '—' },
                { l:'Type',     v: ORDER_TYPE_LABELS[selectedOrder.type] || selectedOrder.type },
                { l:'Payment',  v: PAYMENT_LABELS[selectedOrder.paymentMethod] || selectedOrder.paymentMethod },
                { l:'Source',   v: SOURCE_LABELS[selectedOrder.source] || selectedOrder.source },
                ...(selectedOrder.tableNo ? [{ l:'Table', v:`Table ${selectedOrder.tableNo}` }] : []),
                ...(selectedOrder.callAttempts > 0 ? [{ l:'Call Attempts', v:`${selectedOrder.callAttempts}×` }] : []),
              ].map(m => (
                <div key={m.l} style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:12 }}>
                  <span style={{ color:'var(--text-m)' }}>{m.l}</span>
                  <span style={{ fontWeight:600 }}>{m.v}</span>
                </div>
              ))}
              {selectedOrder.rejectionReason && (
                <div style={{ marginTop:8, padding:'6px 10px', background:'var(--red-soft)', borderRadius:'var(--r)', fontSize:11, color:'var(--red)' }}>
                  Rejected: {selectedOrder.rejectionReason}
                </div>
              )}
            </div>

            {/* Financials block */}
            <div style={{ background:'var(--elevated)', borderRadius:'var(--r)', padding:'14px 16px' }}>
              <div style={{ fontSize:10, fontWeight:800, color:'var(--text-m)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Financials</div>
              {[
                { l:'Subtotal',  v: fmt(selectedOrder.subtotal) },
                { l:'Tax',       v: fmt(selectedOrder.tax) },
                ...(selectedOrder.discount > 0 ? [{ l:'Discount', v:`-${fmt(selectedOrder.discount)}`, c:'var(--green)' }] : []),
              ].map(m => (
                <div key={m.l} style={{ display:'flex', justifyContent:'space-between', marginBottom:6, fontSize:12 }}>
                  <span style={{ color:'var(--text-m)' }}>{m.l}</span>
                  <span style={{ fontWeight:600, color: m.c || 'var(--text)' }}>{m.v}</span>
                </div>
              ))}
              <div style={{ display:'flex', justifyContent:'space-between', paddingTop:10, borderTop:'1px solid var(--border)', marginTop:4 }}>
                <span style={{ fontWeight:700, fontSize:13 }}>Total</span>
                <span style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:900, fontSize:16, color:'var(--accent)' }}>{fmt(selectedOrder.total)}</span>
              </div>
            </div>
          </div>

          {/* Items list */}
          {selectedOrder.items?.length > 0 && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:10, fontWeight:800, color:'var(--text-m)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Items ({selectedOrder.items.length})</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {selectedOrder.items.map((item, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'var(--elevated)', borderRadius:'var(--r)', fontSize:13 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:'var(--surface)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'var(--accent)' }}>
                        {item.image?.slice(0,2) || (i+1)}
                      </div>
                      <div>
                        <div style={{ fontWeight:600 }}>{item.name}</div>
                        <div style={{ fontSize:11, color:'var(--text-m)', marginTop:1 }}>{fmt(item.price)} × {item.qty}</div>
                      </div>
                    </div>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:800, fontSize:14 }}>{fmt(item.total)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Note */}
          {selectedOrder.note && (
            <div style={{ padding:'10px 14px', background:'var(--yellow-soft)', borderRadius:'var(--r)', fontSize:12, color:'var(--yellow)', border:'1px solid rgba(234,179,8,.25)', display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
              <strong>Note:</strong> {selectedOrder.note}
            </div>
          )}

          {/* Actions */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {['pending','confirmed','preparing','ready'].includes(selectedOrder.status) && (
              <button className="btn btn-ghost" style={{ fontSize:11 }} onClick={() => advance(selectedOrder.id)}>
                Advance Status
              </button>
            )}
            {selectedOrder.status === 'pending' && <>
              <button className="btn btn-primary" style={{ fontSize:11 }} onClick={() => { acceptOrder(selectedOrder.id); setSelectedOrder(null); }}>Accept Order</button>
              <button className="btn btn-danger" style={{ fontSize:11 }} onClick={() => { setShowRejectModal(selectedOrder.id); setSelectedOrder(null); }}>Reject Order</button>
            </>}
            <button className="btn btn-ghost" style={{ fontSize:11 }} onClick={() => setSelectedOrder(null)}>Close Detail</button>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {showRejectModal && (
        <Modal title="Reject Order" onClose={() => setShowRejectModal(null)}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ fontSize:13 }}>Rejecting <strong>{showRejectModal}</strong>. Please select a reason:</div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Rejection Reason</div>
              <select className="input" value={rejectReason} onChange={e => setRejectReason(e.target.value)}>
                <option value="">Select reason…</option>
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
              <button className="btn btn-danger" style={{ flex:1, justifyContent:'center' }} onClick={() => { rejectOrder(showRejectModal, rejectReason); setShowRejectModal(null); setRejectReason(''); }}>Confirm Reject</button>
              <button className="btn btn-ghost" onClick={() => setShowRejectModal(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* New order modal */}
      {showNewOrder && (
        <Modal title="Create New Order" onClose={() => setShowNewOrder(false)} maxWidth={560}>
          <div className="grid-form-2">
            <div style={{ gridColumn:'1/-1' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Customer Name *</div>
              <input className="input" value={newOrder.customerName} onChange={e => setNewOrder(f=>({...f,customerName:e.target.value}))} placeholder="Full name"/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Phone</div>
              <input className="input" value={newOrder.customerPhone} onChange={e => setNewOrder(f=>({...f,customerPhone:e.target.value}))} placeholder="+92 300…"/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Branch</div>
              <select className="input" value={newOrder.branchId} onChange={e => setNewOrder(f=>({...f,branchId:e.target.value}))}>
                <option value="">Select branch</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Order Source</div>
              <select className="input" value={newOrder.source} onChange={e => setNewOrder(f=>({...f,source:e.target.value}))}>
                {Object.entries(SOURCE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Order Type</div>
              <select className="input" value={newOrder.type} onChange={e => setNewOrder(f=>({...f,type:e.target.value}))}>
                <option value="dine-in">Dine-in</option>
                <option value="takeaway">Takeaway</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Payment Method</div>
              <select className="input" value={newOrder.paymentMethod} onChange={e => setNewOrder(f=>({...f,paymentMethod:e.target.value}))}>
                {Object.entries(PAYMENT_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Table No. (optional)</div>
              <input className="input" type="number" value={newOrder.tableNo} onChange={e => setNewOrder(f=>({...f,tableNo:e.target.value}))} placeholder="e.g. 5"/>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Note (optional)</div>
              <input className="input" value={newOrder.note} onChange={e => setNewOrder(f=>({...f,note:e.target.value}))} placeholder="Special instructions…"/>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:18 }}>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={handleNewOrder}>Create Order</button>
            <button className="btn btn-ghost" onClick={() => setShowNewOrder(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
