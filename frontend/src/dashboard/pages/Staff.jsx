import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { SectionHeader, Modal } from '../components/ui';
import { ROLES, ROLE_LABELS, ROLE_COLORS, PERMISSIONS, ACTION_LABELS, ACTION_GROUPS } from '../data/mockData';

export default function Staff() {
  const { userList, addStaff, removeStaff, updateStaff, updateStaffPermissions, currentUser, getAccessibleBranches } = useApp();
  const branches = getAccessibleBranches();
  const [showModal, setShowModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(null); // userId to view perms
  const [editUser, setEditUser] = useState(null);
  const [roleFilter,   setRoleFilter  ] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({ name:'', email:'', role:ROLES.COUNTER, branchIds:[], phone:'', status:'offline' });

  const filtered = userList.filter(u => {
    if (roleFilter   !== 'all' && u.role   !== roleFilter)   return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    return true;
  });

  const openAdd = () => {
    setEditUser(null);
    setForm({ name:'', email:'', role:ROLES.COUNTER, branchIds:[], phone:'', status:'offline' });
    setShowModal(true);
  };
  const openEdit = u => {
    setEditUser(u);
    setForm({ name:u.name, email:u.email, role:u.role, branchIds:u.branchIds||[], phone:u.phone||'', status:u.status });
    setShowModal(true);
  };
  const handleSave = () => {
    if (!form.name || !form.email) return;
    const rolePerms = PERMISSIONS[form.role]?.actions?.filter(a => a !== '*') || [];
    const data = {
      name: form.name,
      email: form.email,
      role: form.role,
      branchIds: form.branchIds,
      phone: form.phone || '',
      permissions: rolePerms,
    };
    if (editUser) { updateStaff(editUser.id, data); }
    else          { addStaff(data); }
    setShowModal(false);
  };
  const toggleBranch = bId => setForm(f => ({
    ...f, branchIds: f.branchIds.includes(bId) ? f.branchIds.filter(x => x !== bId) : [...f.branchIds, bId],
  }));

  const saveCustomPermissions = (userId, selectedActions) => {
    updateStaffPermissions(userId, selectedActions);
    setShowPermModal(null);
  };

  const statusDot = { online:'var(--green)', away:'var(--yellow)', offline:'var(--text-m)' };

  // For the permission detail panel
  const permUser = showPermModal ? userList.find(u => u.id === showPermModal) : null;
  const permData = permUser ? PERMISSIONS[permUser.role] : null;
  const roleActions = permUser?.permissions?.length
    ? permUser.permissions
    : (permData?.actions?.includes('*') ? Object.keys(ACTION_LABELS) : (permData?.actions || []));
  const rolePages   = permData?.pages?.includes('*') ? ['all'] : (permData?.pages || []);

  return (
    <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:18 }}>Staff & Roles</h2>
          <p style={{ fontSize:12, color:'var(--text-m)', marginTop:2 }}>{userList.length} members · {userList.filter(u=>u.status==='online').length} online</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Invite Member</button>
      </div>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <select className="input" style={{ width:'auto', padding:'6px 10px', fontSize:12 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          {Object.entries(ROLE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="input" style={{ width:'auto', padding:'6px 10px', fontSize:12 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="online">Online</option>
          <option value="away">Away</option>
          <option value="offline">Offline</option>
        </select>
        <span style={{ fontSize:12, color:'var(--text-m)', alignSelf:'center', marginLeft:'auto' }}>{filtered.length} shown</span>
      </div>

      <div className="grid3">
        {filtered.map((s, i) => (
          <div key={s.id} className="card fade-up" style={{ animationDelay:`${i*50}ms`, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:`${s.color}22`, border:`2px solid ${s.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14, color:s.color, flexShrink:0 }}>{s.avatar}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{s.name}</div>
                <div style={{ fontSize:11, color:'var(--text-m)', marginTop:1 }}>{ROLE_LABELS[s.role]||s.role}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background: statusDot[s.status]||'var(--text-m)' }}/>
                <span style={{ fontSize:10, color:'var(--text-s)', textTransform:'capitalize' }}>{s.status}</span>
              </div>
            </div>
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:11, color:'var(--text-s)' }}>Role</span>
                <span className={`badge badge-${ROLE_COLORS[s.role]||'gray'}`}>{ROLE_LABELS[s.role]||s.role}</span>
              </div>
              <div style={{ fontSize:11, color:'var(--text-m)' }}>{s.email}</div>
              {s.branchIds?.length > 0 && (
                <div style={{ fontSize:11, color:'var(--text-m)', marginTop:3 }}>{s.branchIds.length} branch access</div>
              )}
              <div style={{ fontSize:10, color:'var(--text-m)', marginTop:3 }}>
                Joined {new Date(s.createdAt).toLocaleDateString('en',{month:'short',year:'numeric'})}
              </div>
              {/* Permissions summary */}
              <div style={{ marginTop:8 }}>
                {(() => {
                  const p = PERMISSIONS[s.role];
                  const cnt = p?.actions?.includes('*') ? 'All Permissions' : `${p?.actions?.length||0} permissions`;
                  const pg  = p?.pages?.includes('*') ? 'All Pages' : `${p?.pages?.length||0} pages`;
                  return (
                    <div style={{ display:'flex', gap:6 }}>
                      <span className="badge badge-gray" style={{ fontSize:9 }}>{cnt}</span>
                      <span className="badge badge-gray" style={{ fontSize:9 }}>{pg}</span>
                    </div>
                  );
                })()}
              </div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <button className="btn btn-ghost" style={{ flex:1, justifyContent:'center', fontSize:11 }} onClick={() => setShowPermModal(s.id)}>Permissions</button>
              <button className="btn btn-ghost" style={{ flex:1, justifyContent:'center', fontSize:11 }} onClick={() => openEdit(s)}>Edit</button>
              <button className="btn btn-danger" style={{ flex:1, justifyContent:'center', fontSize:11 }} onClick={() => removeStaff(s.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Permission Detail Modal ── */}
      {showPermModal && permUser && (
        <Modal title={`Permissions — ${permUser.name}`} onClose={() => setShowPermModal(null)} maxWidth={620}>
          <div style={{ marginBottom:14 }}>
            <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:14 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:`${permUser.color}22`, border:`2px solid ${permUser.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, color:permUser.color }}>{permUser.avatar}</div>
              <div>
                <div style={{ fontWeight:700 }}>{permUser.name}</div>
                <span className={`badge badge-${ROLE_COLORS[permUser.role]||'gray'}`}>{ROLE_LABELS[permUser.role]||permUser.role}</span>
              </div>
            </div>

            {/* Pages access */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:800, color:'var(--text-m)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Page Access</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {rolePages.includes('all')
                  ? <span className="badge badge-green">All Pages</span>
                  : rolePages.map(pg => (
                    <span key={pg} className="badge badge-blue" style={{ textTransform:'capitalize' }}>{pg}</span>
                  ))
                }
              </div>
            </div>

            {/* Actions by group */}
            <div style={{ fontSize:11, fontWeight:800, color:'var(--text-m)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Action Permissions</div>
            {roleActions.length === 0 ? (
              <div style={{ fontSize:12, color:'var(--text-m)', padding:'12px', background:'var(--elevated)', borderRadius:'var(--r)' }}>No specific actions assigned.</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {Object.entries(ACTION_GROUPS).map(([groupName, groupActions]) => {
                  const allowed = groupActions.filter(a => roleActions.includes(a) || roleActions.includes('*'));
                  if (allowed.length === 0) return null;
                  return (
                    <div key={groupName}>
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--text-s)', marginBottom:6 }}>{groupName}</div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
                        {groupActions.map(action => {
                          const isAllowed = roleActions.includes(action) || roleActions.includes('*');
                          return (
                            <div key={action} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', borderRadius:'var(--r)', background:'var(--elevated)', opacity: isAllowed ? 1 : 0.4 }}>
                              <span style={{ width:14, height:14, borderRadius:3, background: isAllowed ? 'var(--green)' : 'var(--border)', border:`1px solid ${isAllowed ? 'var(--green)' : 'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                {isAllowed && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                              </span>
                              <span style={{ fontSize:11, color: isAllowed ? 'var(--text-s)' : 'var(--text-m)' }}>{ACTION_LABELS[action] || action}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{ display:'flex', gap:10, marginTop:4 }}>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={() => { openEdit(permUser); setShowPermModal(null); }}>Edit Role</button>
            {currentUser?.role === ROLES.CLIENT_ADMIN && permUser?.role !== ROLES.CLIENT_ADMIN && (
              <button
                className="btn btn-ghost"
                style={{ flex:1, justifyContent:'center' }}
                onClick={() => saveCustomPermissions(permUser.id, roleActions)}
              >
                Save Permissions
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => setShowPermModal(null)}>Close</button>
          </div>
        </Modal>
      )}

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <Modal title={editUser ? 'Edit Team Member' : 'Invite Team Member'} onClose={() => setShowModal(false)}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ gridColumn:'1/-1' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Full Name *</div>
                <input className="input" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} placeholder="Full name"/>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Email *</div>
                <input className="input" type="email" value={form.email} onChange={e => setForm(f=>({...f,email:e.target.value}))} placeholder="name@example.com"/>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Phone</div>
                <input className="input" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} placeholder="+92 300…"/>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Role *</div>
                <select className="input" value={form.role} onChange={e => setForm(f=>({...f,role:e.target.value}))}>
                  {Object.entries(ROLE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Status</div>
                <select className="input" value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}>
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                  <option value="away">Away</option>
                </select>
              </div>
            </div>

            {/* Role permission preview */}
            {form.role && (
              <div style={{ background:'var(--elevated)', borderRadius:'var(--r)', padding:'12px 14px' }}>
                <div style={{ fontSize:11, fontWeight:700, marginBottom:8, color:'var(--text-s)' }}>
                  Role Preview — {ROLE_LABELS[form.role]}
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {(() => {
                    const p = PERMISSIONS[form.role];
                    const pages = p?.pages?.includes('*') ? ['All Pages'] : (p?.pages || []);
                    return pages.map(pg => <span key={pg} className="badge badge-blue" style={{ fontSize:9, textTransform:'capitalize' }}>{pg}</span>);
                  })()}
                </div>
                <div style={{ fontSize:10, color:'var(--text-m)', marginTop:6 }}>
                  {(() => {
                    const p = PERMISSIONS[form.role];
                    if (p?.actions?.includes('*')) return 'Full access to all actions';
                    return `${p?.actions?.length || 0} specific actions permitted`;
                  })()}
                  {' · '}
                  <button onClick={() => { setShowPermModal(editUser?.id || null); }} style={{ fontSize:10, color:'var(--accent)', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>
                    View details
                  </button>
                </div>
              </div>
            )}

            {/* Branch access */}
            {branches.length > 0 && (
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.06em' }}>Branch Access</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {branches.map(b => (
                    <button key={b.id} onClick={() => toggleBranch(b.id)}
                      style={{ padding:'5px 12px', borderRadius:99, fontSize:11, fontWeight:600, cursor:'pointer', border:'1px solid', transition:'.12s', borderColor: form.branchIds.includes(b.id) ? 'var(--accent)' : 'var(--border)', background: form.branchIds.includes(b.id) ? 'var(--accent-soft)' : 'var(--elevated)', color: form.branchIds.includes(b.id) ? 'var(--accent)' : 'var(--text-s)' }}>
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background:'var(--elevated)', borderRadius:'var(--r)', padding:'10px 14px', fontSize:11, color:'var(--text-m)' }}>
              A temporary password will be emailed to the staff member. They must change it on first login.
            </div>
            <div style={{ display:'flex', gap:10, marginTop:4 }}>
              <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={handleSave}>{editUser ? 'Save Changes' : 'Send Invite'}</button>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
