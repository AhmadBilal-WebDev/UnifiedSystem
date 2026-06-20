import React, { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { fmt, SectionHeader, Modal } from '../components/ui';
import { POS_SYSTEMS, PAYMENT_LABELS } from '../data/mockData';

export default function POSIntegration() {
  const { branchList, getClientBranches, orderList, getPOSTransactions, fetchPOSTransactions, syncPOSOrder, updateBranch, addToast, activeBranchId } = useApp();
  const branches = getClientBranches();
  const posBranches = branches.filter(b => b.posEnabled);
  const [selectedBranch, setSelectedBranch] = useState(activeBranchId || (posBranches[0]?.id || null));
  const [activeTab, setActiveTab] = useState('overview');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncForm, setSyncForm] = useState({ branchId: selectedBranch || '', customerName:'Walk-in Customer', tableNo:'', paymentMethod:'pos_cash', items:[], note:'' });
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configBranch, setConfigBranch] = useState(null);

  const posTrans = useMemo(() => getPOSTransactions(selectedBranch || null), [getPOSTransactions, selectedBranch]);
  const posOrders = useMemo(() => orderList.filter(o => o.source === 'pos' && (!selectedBranch || o.branchId === selectedBranch)).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)), [orderList, selectedBranch]);

  const todayPOS = posOrders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const todayRevenue = todayPOS.reduce((s,o)=>s+o.total,0);
  const avgOrderValue = posTrans.length > 0 ? Math.round(posTrans.reduce((s,t)=>s+t.total,0) / posTrans.length) : 0;

  const handleSyncOrder = () => {
    if (!syncForm.branchId) { addToast('Select a branch', 'warning'); return; }
    const items = [{ name: 'POS Item', qty: 1, price: 1000, total: 1000 }];
    syncPOSOrder(syncForm.branchId, {
      customerName: syncForm.customerName,
      tableNo: syncForm.tableNo ? parseInt(syncForm.tableNo) : null,
      paymentMethod: syncForm.paymentMethod,
      items,
      subtotal: 1000,
      tax: 160,
      total: 1160,
    });
    setShowSyncModal(false);
  };

  const handleConfigSave = () => {
    if (!configBranch) return;
    updateBranch(configBranch.id, { posEnabled: configBranch.posEnabled, posSystem: configBranch.posSystem });
    setShowConfigModal(false);
  };

  const getTimeSince = (date) => {
    if (!date) return 'Never';
    const mins = Math.round((Date.now() - new Date(date)) / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins/60)}h ago`;
  };

  const getSyncStatusColor = (lastSync) => {
    if (!lastSync) return 'var(--red)';
    const mins = (Date.now() - new Date(lastSync)) / 60000;
    if (mins < 5) return 'var(--green)';
    if (mins < 30) return 'var(--yellow)';
    return 'var(--red)';
  };

  return (
    <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:18 }}>POS Integration</h2>
          <p style={{ fontSize:12, color:'var(--text-m)', marginTop:2 }}>{posBranches.length} branches connected · Real-time sync</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-ghost" onClick={() => { setShowSyncModal(true); setSyncForm(f=>({...f, branchId: selectedBranch || ''})); }}>+ Manual Sync</button>
          <button className="btn btn-primary" onClick={async () => { addToast('Refreshing POS data...', 'info'); await fetchPOSTransactions(selectedBranch || undefined); addToast('POS data refreshed!', 'success'); }}>Refresh POS Data</button>
        </div>
      </div>

      {/* Branch Status Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:12 }}>
        {branches.map(b => (
          <div key={b.id} onClick={() => setSelectedBranch(b.posEnabled ? b.id : selectedBranch)}
            className="card fade-up"
            style={{ cursor: b.posEnabled ? 'pointer' : 'default', border: selectedBranch === b.id ? '1px solid var(--accent)' : '1px solid var(--border)', opacity: b.posEnabled ? 1 : 0.6 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ fontWeight:700, fontSize:14 }}>{b.name}</div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                {b.posEnabled ? (
                  <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color: getSyncStatusColor(b.posLastSync) }}>
                    <span style={{ width:7, height:7, borderRadius:'50%', background: getSyncStatusColor(b.posLastSync) }}/>
                    Connected
                  </span>
                ) : (
                  <span className="badge badge-gray">No POS</span>
                )}
                <button className="btn btn-ghost" style={{ fontSize:10, padding:'2px 8px' }} onClick={e => { e.stopPropagation(); setConfigBranch({...b}); setShowConfigModal(true); }}>Config</button>
              </div>
            </div>
            {b.posEnabled ? (
              <>
                <div style={{ fontSize:11, color:'var(--text-m)', marginBottom:8 }}>{b.posSystem}</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {[
                    { l:'Last Sync', v: getTimeSince(b.posLastSync) },
                    { l:'System', v: b.posSystem || '—' },
                  ].map(m => (
                    <div key={m.l} style={{ background:'var(--elevated)', borderRadius:'var(--r)', padding:'8px 10px' }}>
                      <div style={{ fontSize:9, color:'var(--text-m)', textTransform:'uppercase', letterSpacing:'.05em', fontWeight:700 }}>{m.l}</div>
                      <div style={{ fontWeight:700, fontSize:12, marginTop:2 }}>{m.v}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ fontSize:12, color:'var(--text-m)' }}>Click Config to enable POS integration for this branch.</div>
            )}
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { l:'Today POS Orders', v: todayPOS.length, color:'var(--accent)', sub:'From POS terminals' },
          { l:'Today POS Revenue', v: fmt(todayRevenue), color:'var(--green)', sub:'Synced to dashboard' },
          { l:'Total POS Transactions', v: posTrans.length, color:'var(--blue)', sub:'All time' },
          { l:'Average Order Value', v: fmt(avgOrderValue), color:'var(--accent)', sub:'Per POS transaction' },
        ].map(s => (
          <div key={s.l} className="card" style={{ padding:'14px 16px' }}>
            <div style={{ fontSize:22, fontWeight:900, color:s.color, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{s.v}</div>
            <div style={{ fontSize:11, fontWeight:700, marginTop:2 }}>{s.l}</div>
            <div style={{ fontSize:10, color:'var(--text-m)', marginTop:2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:6 }}>
        {['overview','transactions','orders'].map(t => (
          <button key={t} className={`tab ${activeTab===t?'active':''}`} onClick={()=>setActiveTab(t)} style={{ textTransform:'capitalize' }}>{t}</button>
        ))}
        {selectedBranch && (
          <select className="input" style={{ marginLeft:'auto', width:'auto', padding:'4px 10px', fontSize:12 }} value={selectedBranch||''} onChange={e=>setSelectedBranch(e.target.value||null)}>
            <option value="">All POS Branches</option>
            {posBranches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
      </div>

      {activeTab==='overview' && (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
            <SectionHeader title="POS Branch Overview" sub="Real-time status of all connected terminals"/>
          </div>
          <table className="table">
            <thead>
              <tr><th>Branch</th><th>POS System</th><th>Status</th><th>Last Sync</th><th>Today Orders</th><th>Today Revenue</th><th>Avg Order</th><th>Action</th></tr>
            </thead>
            <tbody>
              {branches.map(b => {
                const bOrders = posOrders.filter(o=>o.branchId===b.id&&new Date(o.createdAt).toDateString()===new Date().toDateString());
                const bRev = bOrders.reduce((s,o)=>s+o.total,0);
                const bAvg = bOrders.length > 0 ? Math.round(bRev / bOrders.length) : 0;
                const statusColor = b.posEnabled ? getSyncStatusColor(b.posLastSync) : 'var(--text-m)';
                return (
                  <tr key={b.id}>
                    <td><div style={{ fontWeight:700 }}>{b.name}</div><div style={{ fontSize:10, color:'var(--text-m)' }}>{b.city}</div></td>
                    <td><span style={{ fontSize:12 }}>{b.posEnabled ? b.posSystem : '—'}</span></td>
                    <td>
                      {b.posEnabled ? (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:11, color:statusColor }}>
                          <span style={{ width:7, height:7, borderRadius:'50%', background:statusColor }}/> Connected
                        </span>
                      ) : <span className="badge badge-gray">Not Connected</span>}
                    </td>
                    <td style={{ fontSize:12, color:'var(--text-m)' }}>{getTimeSince(b.posLastSync)}</td>
                    <td style={{ fontWeight:700 }}>{bOrders.length}</td>
                    <td style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:12 }}>{fmt(bRev)}</td>
                    <td style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>{bAvg > 0 ? fmt(bAvg) : '—'}</td>
                    <td>
                      <div style={{ display:'flex', gap:4 }}>
                        <button className="btn btn-ghost" style={{ fontSize:11, padding:'3px 8px' }} onClick={async ()=>{ addToast(`Refreshing ${b.name}...`,'info'); await fetchPOSTransactions(b.id); addToast(`${b.name} refreshed!`,'success'); }}>Refresh</button>
                        <button className="btn btn-ghost" style={{ fontSize:11, padding:'3px 8px' }} onClick={()=>{setConfigBranch({...b});setShowConfigModal(true);}}>Config</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab==='transactions' && (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
            <SectionHeader title="POS Transactions" sub={`${posTrans.length} total POS orders`}/>
          </div>
          <table className="table">
            <thead>
              <tr><th>Order ID</th><th>Branch</th><th>Customer</th><th>Table</th><th>Payment</th><th>Total</th><th>Time</th><th>Status</th></tr>
            </thead>
            <tbody>
              {posTrans.slice(0,30).map(t => (
                <tr key={t.id}>
                  <td><span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:11, color:'var(--accent)' }}>{String(t.id).slice(-8)}</span></td>
                  <td style={{ fontSize:12 }}>{branchList.find(b=>b.id===t.branchId || b._id===t.branchId)?.name || (t.branchId?.name || '—')}</td>
                  <td style={{ fontWeight:600 }}>{t.customerName || 'Walk-in Customer'}</td>
                  <td>{t.tableNo ? `T-${t.tableNo}` : '—'}</td>
                  <td><span className="badge badge-gray" style={{ textTransform:'capitalize' }}>{t.paymentMethod}</span></td>
                  <td style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:12 }}>{fmt(t.total)}</td>
                  <td style={{ fontSize:11, color:'var(--text-m)' }}>{new Date(t.createdAt).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})}</td>
                  <td><span className={`badge badge-${t.status==='delivered'?'green':'yellow'}`} style={{ textTransform:'capitalize' }}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab==='orders' && (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
            <SectionHeader title="POS-Sourced Orders" sub="Orders received from POS terminals"/>
          </div>
          <table className="table">
            <thead>
              <tr><th>Order ID</th><th>Branch</th><th>Customer</th><th>Table</th><th>Items</th><th>Total</th><th>Status</th><th>Time</th></tr>
            </thead>
            <tbody>
              {posOrders.slice(0,30).map(o => (
                <tr key={o.id}>
                  <td><span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:11, color:'var(--accent)' }}>{o.id}</span></td>
                  <td style={{ fontSize:12 }}>{branchList.find(b=>b.id===o.branchId)?.name || o.branchId}</td>
                  <td style={{ fontWeight:600 }}>{o.customerName}</td>
                  <td>{o.tableNo ? `T-${o.tableNo}` : '—'}</td>
                  <td>{o.items?.length || 0}</td>
                  <td style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, fontSize:12 }}>{fmt(o.total)}</td>
                  <td><span className={`badge badge-${o.status==='delivered'?'green':o.status==='confirmed'?'blue':'yellow'}`} style={{ textTransform:'capitalize' }}>{o.status}</span></td>
                  <td style={{ fontSize:11, color:'var(--text-m)' }}>{new Date(o.createdAt).toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'})}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Sync Modal */}
      {showSyncModal && (
        <Modal title="Manual POS Order Sync" onClose={()=>setShowSyncModal(false)} maxWidth={480}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Branch</div>
              <select className="input" value={syncForm.branchId} onChange={e=>setSyncForm(f=>({...f,branchId:e.target.value}))}>
                <option value="">Select branch</option>
                {posBranches.map(b=><option key={b.id} value={b.id}>{b.name} — {b.posSystem}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Customer Name</div>
              <input className="input" value={syncForm.customerName} onChange={e=>setSyncForm(f=>({...f,customerName:e.target.value}))} placeholder="Walk-in Customer"/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Table Number</div>
                <input className="input" type="number" value={syncForm.tableNo} onChange={e=>setSyncForm(f=>({...f,tableNo:e.target.value}))} placeholder="e.g. 5"/>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Payment Method</div>
                <select className="input" value={syncForm.paymentMethod} onChange={e=>setSyncForm(f=>({...f,paymentMethod:e.target.value}))}>
                  <option value="pos_cash">POS Cash</option>
                  <option value="card">Card</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="easypaisa">Easypaisa</option>
                </select>
              </div>
            </div>
            <div style={{ background:'var(--elevated)', borderRadius:'var(--r)', padding:'12px 14px', fontSize:12, color:'var(--text-m)' }}>
              This will create a confirmed order in the dashboard linked to the POS terminal. The cashier at the POS branch will see confirmation in their system.
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={handleSyncOrder}>Sync Order</button>
              <button className="btn btn-ghost" onClick={()=>setShowSyncModal(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Config Modal */}
      {showConfigModal && configBranch && (
        <Modal title={`POS Config — ${configBranch.name}`} onClose={()=>setShowConfigModal(false)} maxWidth={480}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight:600, fontSize:13 }}>Enable POS Integration</div>
                <div style={{ fontSize:11, color:'var(--text-m)', marginTop:2 }}>Allow this branch to sync orders from POS terminal</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={configBranch.posEnabled} onChange={e=>setConfigBranch(c=>({...c,posEnabled:e.target.checked}))}/>
                <span className="toggle-slider"/>
              </label>
            </div>
            {configBranch.posEnabled && (
              <>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>POS System</div>
                  <select className="input" value={configBranch.posSystem||''} onChange={e=>setConfigBranch(c=>({...c,posSystem:e.target.value}))}>
                    {POS_SYSTEMS.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ background:'var(--elevated)', borderRadius:'var(--r)', padding:'12px 14px' }}>
                  <div style={{ fontSize:12, fontWeight:600, marginBottom:8 }}>Integration Details</div>
                  {[
                    { l:'Webhook URL', v:'https://api.restaurantos.com/pos/webhook' },
                    { l:'API Key', v:'rsk_live_pos_9xB4kGhM...m3Kp' },
                    { l:'Branch Token', v:`tok_${configBranch.id}_${Date.now().toString(36)}` },
                  ].map(f=>(
                    <div key={f.l} style={{ marginBottom:8 }}>
                      <div style={{ fontSize:10, color:'var(--text-m)', fontWeight:700, marginBottom:3 }}>{f.l}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ flex:1, fontFamily:"'JetBrains Mono',monospace", fontSize:11, padding:'6px 10px', background:'var(--bg-base)', borderRadius:'var(--r)', color:'var(--text-s)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.v}</div>
                        <button className="btn btn-ghost" style={{ fontSize:10, padding:'4px 8px', flexShrink:0 }} onClick={()=>{ navigator.clipboard.writeText(f.v); addToast('Copied!','success'); }}>Copy</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:600, marginBottom:8 }}>Sync Settings</div>
                  {[
                    { l:'Auto-sync new POS orders to dashboard', d:'Orders placed at POS appear instantly here' },
                    { l:'Push accepted/rejected status to POS', d:'Counter decisions reflected in POS terminal' },
                    { l:'Revenue consolidation', d:'POS revenue added to branch daily totals' },
                  ].map((s,i)=>(
                    <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom: i<2 ? '1px solid var(--border)' : 'none' }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:600 }}>{s.l}</div>
                        <div style={{ fontSize:11, color:'var(--text-m)', marginTop:1 }}>{s.d}</div>
                      </div>
                      <label className="toggle"><input type="checkbox" defaultChecked/><span className="toggle-slider"/></label>
                    </div>
                  ))}
                </div>
              </>
            )}
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={handleConfigSave}>Save Configuration</button>
              <button className="btn btn-ghost" onClick={()=>setShowConfigModal(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
