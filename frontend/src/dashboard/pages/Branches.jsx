import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { fmt, LiveDot, Modal, SectionHeader } from '../components/ui';
import { CITIES, POS_SYSTEMS } from '../data/mockData';

export default function Branches() {
  const { branchList, updateBranch, getClientBranches, addBranchArea, removeBranchArea, addToast } = useApp();
  const branches = getClientBranches();
  const topRev = Math.max(...branches.map(b=>b.revenue||0), 1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBranch, setEditBranch] = useState(null);
  const [form, setForm] = useState({});
  const [newArea, setNewArea] = useState({});

  const openEdit = (b) => {
    setEditBranch(b);
    setForm({ name:b.name, address:b.address||'', city:b.city||'Karachi', phone:b.phone||'', openTime:b.openTime||'09:00', closeTime:b.closeTime||'22:00', tables:b.tables||20, staff:b.staff||8, status:b.status||'open', posEnabled:b.posEnabled||false, posSystem:b.posSystem||'None' });
    setShowEditModal(true);
  };
  const handleSave = () => {
    if (!editBranch) return;
    updateBranch(editBranch.id, { ...form, tables:parseInt(form.tables)||20, staff:parseInt(form.staff)||8 });
    setShowEditModal(false);
  };
  const toggle = (b) => updateBranch(b.id, { status: b.status==='open' ? 'closed' : 'open' });

  const handleAddArea = (branch) => {
    const area = (newArea[branch.id] || '').trim();
    if (!area) return;
    addBranchArea(branch.id, area);
    setNewArea(prev => ({ ...prev, [branch.id]: '' }));
  };

  return (
    <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:18 }}>Branches</h2>
          <p style={{ fontSize:12, color:'var(--text-m)', marginTop:2 }}>
            {branches.filter(b=>b.status==='open').length} open · {branches.filter(b=>b.posEnabled).length} POS connected · {branches.length} total
          </p>
        </div>
      </div>

      {/* Summary row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {[
          { l:'Total Branches', v:branches.length, color:'var(--text)' },
          { l:'Open Now', v:branches.filter(b=>b.status==='open').length, color:'var(--green)' },
          { l:'POS Connected', v:branches.filter(b=>b.posEnabled).length, color:'var(--blue)' },
          { l:'Total Revenue', v:fmt(branches.reduce((s,b)=>s+(b.revenue||0),0)), color:'var(--accent)' },
        ].map(s=>(
          <div key={s.l} className="card" style={{ padding:'14px 16px' }}>
            <div style={{ fontSize:20, fontWeight:900, color:s.color, fontFamily:"'Plus Jakarta Sans',sans-serif" }}>{s.v}</div>
            <div style={{ fontSize:11, color:'var(--text-m)', marginTop:2, fontWeight:600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {branches.map((b,i) => (
          <div key={b.id} className="card fade-up" style={{ animationDelay:`${i*50}ms` }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:20, alignItems:'start' }}>
              <div style={{ display:'flex', gap:16, alignItems:'flex-start', flexWrap:'wrap' }}>
                <div style={{ width:48, height:48, background:b.status==='open'?'var(--green-soft)':'var(--elevated)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, border:`1px solid ${b.status==='open'?'rgba(16,217,126,.44)':'var(--border)'}`, fontWeight:800, color:'var(--text-m)', flexShrink:0 }}>
                  {b.name.slice(0,2).toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:15 }}>{b.name}</div>
                    <span className={`badge badge-${b.status==='open'?'green':b.status==='maintenance'?'yellow':'red'}`}>
                      {b.status==='open' && <LiveDot color="var(--green)" size={6}/>} {b.status}
                    </span>
                    {b.posEnabled && <span className="badge badge-blue">POS</span>}
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-m)', marginTop:3 }}>{b.address || b.city} · {b.city}</div>
                  {b.phone && <div style={{ fontSize:12, color:'var(--text-m)' }}>{b.phone}</div>}
                  {b.posEnabled && <div style={{ fontSize:11, color:'var(--blue)', marginTop:2 }}>POS: {b.posSystem}</div>}
                  <div style={{ display:'flex', gap:20, marginTop:10, flexWrap:'wrap' }}>
                    {[
                      { l:'Revenue', v:fmt(b.revenue||0) },
                      { l:'Orders', v:(b.orders||0).toLocaleString() },
                      { l:'Rating', v:`${b.rating}★` },
                      { l:'Staff', v:b.staff },
                      { l:'Tables', v:b.tables },
                      { l:'Avg Prep', v:`${b.avgPrep||8}m` },
                      { l:'Hours', v:`${b.openTime}–${b.closeTime}` },
                    ].map(m=>(
                      <div key={m.l}>
                        <div style={{ fontSize:9, color:'var(--text-m)', textTransform:'uppercase', letterSpacing:'.05em', fontWeight:700 }}>{m.l}</div>
                        <div style={{ fontWeight:800, fontSize:13, marginTop:2 }}>{m.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop:10 }}>
                    <div style={{ fontSize:10, color:'var(--text-m)', marginBottom:4 }}>Revenue share</div>
                    <div className="progress" style={{ width:200 }}>
                      <div className="progress-fill" style={{ width:`${Math.round((b.revenue||0)/topRev*100)}%`, background:'linear-gradient(90deg,var(--accent),var(--accent-h))' }}/>
                    </div>
                  </div>
                  <div style={{ marginTop:12 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:6 }}>Delivery Areas / Towns</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:8 }}>
                      {(b.areas || []).length === 0 && (
                        <span style={{ fontSize:11, color:'var(--text-m)' }}>No areas added yet</span>
                      )}
                      {(b.areas || []).map(area => (
                        <span key={area} className="badge badge-blue" style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
                          {area}
                          <button
                            type="button"
                            onClick={() => removeBranchArea(b.id, area)}
                            style={{ background:'none', border:'none', color:'inherit', cursor:'pointer', fontSize:12, lineHeight:1 }}
                          >×</button>
                        </span>
                      ))}
                    </div>
                    <div style={{ display:'flex', gap:8 }}>
                      <input
                        className="input"
                        style={{ flex:1, fontSize:12 }}
                        placeholder="Add town or area (e.g. Model Town)"
                        value={newArea[b.id] || ''}
                        onChange={e => setNewArea(prev => ({ ...prev, [b.id]: e.target.value }))}
                        onKeyDown={e => e.key === 'Enter' && handleAddArea(b)}
                      />
                      <button className="btn btn-ghost" style={{ fontSize:11 }} onClick={() => handleAddArea(b)}>Add</button>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, alignItems:'flex-end', flexShrink:0 }}>
                <button className="btn btn-ghost" style={{ fontSize:11 }} onClick={()=>openEdit(b)}>Edit</button>
                <button onClick={()=>toggle(b)} className={`btn btn-${b.status==='open'?'danger':'ghost'}`} style={{ fontSize:11 }}>{b.status==='open'?'Close':'Open'}</button>
                <button className="btn btn-ghost" style={{ fontSize:11 }} onClick={()=>addToast(`Loading analytics for ${b.name}...`,'info')}>Analytics</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showEditModal && editBranch && (
        <Modal title={`Edit — ${editBranch.name}`} onClose={()=>setShowEditModal(false)} maxWidth={560}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Branch Name</div>
              <input className="input" value={form.name||''} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Address</div>
              <input className="input" value={form.address||''} onChange={e=>setForm(f=>({...f,address:e.target.value}))}/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>City</div>
              <select className="input" value={form.city||'Karachi'} onChange={e=>setForm(f=>({...f,city:e.target.value}))}>
                {CITIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Phone</div>
              <input className="input" value={form.phone||''} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+92-21-..."/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Status</div>
              <select className="input" value={form.status||'open'} onChange={e=>setForm(f=>({...f,status:e.target.value}))}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Tables</div>
              <input className="input" type="number" value={form.tables||20} onChange={e=>setForm(f=>({...f,tables:e.target.value}))}/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Open Time</div>
              <input className="input" type="time" value={form.openTime||'09:00'} onChange={e=>setForm(f=>({...f,openTime:e.target.value}))}/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Close Time</div>
              <input className="input" type="time" value={form.closeTime||'22:00'} onChange={e=>setForm(f=>({...f,closeTime:e.target.value}))}/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>POS System</div>
              <select className="input" value={form.posSystem||'None'} onChange={e=>setForm(f=>({...f,posSystem:e.target.value}))}>
                {POS_SYSTEMS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, gridColumn:'1/-1' }}>
              <label className="toggle"><input type="checkbox" checked={form.posEnabled||false} onChange={e=>setForm(f=>({...f,posEnabled:e.target.checked}))}/><span className="toggle-slider"/></label>
              <div>
                <div style={{ fontWeight:600, fontSize:13 }}>POS Integration Enabled</div>
                <div style={{ fontSize:11, color:'var(--text-m)' }}>Allow this branch to sync orders with POS terminal</div>
              </div>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:18 }}>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={handleSave}>Save Changes</button>
            <button className="btn btn-ghost" onClick={()=>setShowEditModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
