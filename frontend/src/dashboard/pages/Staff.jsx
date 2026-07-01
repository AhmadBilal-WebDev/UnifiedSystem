import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { SectionHeader, Modal } from '../components/ui';
import {
  ROLES, ROLE_LABELS, ROLE_COLORS, PERMISSIONS, ACTION_LABELS, ACTION_GROUPS,
  INVITE_ROLES, getDefaultPermissionsForRole,
} from '../data/mockData';

const ACCOUNT_STATUS_LABELS = { active: 'Active', blocked: 'Blocked', inactive: 'Inactive' };

function CredentialsModal({ data, onClose }) {
  if (!data) return null;
  const copy = (text) => {
    navigator.clipboard?.writeText(text);
  };

  return (
    <Modal title="Staff Login Credentials" onClose={onClose} maxWidth={480}>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        <div style={{ background:'var(--green-soft)', border:'1px solid rgba(16,217,126,.35)', borderRadius:'var(--r)', padding:'12px 14px', fontSize:12, color:'var(--green)' }}>
          {data.emailSent
            ? `Login details were emailed to ${data.email}.`
            : 'Email could not be sent. Copy the credentials below and share them with the staff member.'}
        </div>

        <div>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase' }}>Staff Member</div>
          <div style={{ fontWeight:700 }}>{data.name}</div>
        </div>

        <div>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase' }}>Login URL</div>
          <div style={{ display:'flex', gap:8 }}>
            <input className="input" readOnly value={data.loginUrl || 'http://localhost:5173/admin'} />
            <button type="button" className="btn btn-ghost" onClick={() => copy(data.loginUrl, 'url')}>Copy</button>
          </div>
        </div>

        <div>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase' }}>Email</div>
          <div style={{ display:'flex', gap:8 }}>
            <input className="input" readOnly value={data.email} />
            <button type="button" className="btn btn-ghost" onClick={() => copy(data.email, 'email')}>Copy</button>
          </div>
        </div>

        <div>
          <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase' }}>Password</div>
          <div style={{ display:'flex', gap:8 }}>
            <input className="input" readOnly value={data.tempPassword || '(not returned — restart backend server)'} style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }} />
            {data.tempPassword && (
              <button type="button" className="btn btn-ghost" onClick={() => copy(data.tempPassword)}>Copy</button>
            )}
          </div>
        </div>

        <p style={{ fontSize:11, color:'var(--text-m)' }}>
          They can sign in at <strong>/admin</strong>, then change the password from Settings → Security.
        </p>

        <button type="button" className="btn btn-primary" style={{ width:'100%', justifyContent:'center' }} onClick={onClose}>
          Done
        </button>
      </div>
    </Modal>
  );
}

export default function Staff() {
  const {
    userList, addStaff, removeStaff, updateStaff, updateStaffPermissions,
    resetStaffPassword, currentUser, getAccessibleBranches,
  } = useApp();
  const branches = getAccessibleBranches();
  const [showModal, setShowModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(null);
  const [permEditMode, setPermEditMode] = useState(false);
  const [permDraft, setPermDraft] = useState([]);
  const [credentialsModal, setCredentialsModal] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: ROLES.COUNTER, branchIds: [], phone: '', status: 'active',
  });
  const [resetTarget, setResetTarget] = useState(null);
  const [resetPassword, setResetPassword] = useState('');

  const filtered = userList.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    return true;
  });

  const openAdd = () => {
    setEditUser(null);
    setForm({
      name: '',
      email: '',
      password: '',
      role: ROLES.COUNTER,
      branchIds: branches.length === 1 ? [branches[0].id] : [],
      phone: '',
      status: 'active',
    });
    setShowModal(true);
  };

  const openEdit = (u) => {
    setEditUser(u);
    setForm({
      name: u.name,
      email: u.email,
      role: u.role,
      branchIds: (u.branchIds || []).map(b => b?.id || b?._id || b),
      phone: u.phone || '',
      status: u.status || 'active',
    });
    setShowModal(true);
  };

  const openPermissions = (u) => {
    const perms = u.permissions?.length
      ? u.permissions
      : getDefaultPermissionsForRole(u.role);
    setPermDraft(perms);
    setPermEditMode(false);
    setShowPermModal(u.id);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) return;
    if (!editUser && branches.length > 0 && form.branchIds.length === 0) {
      alert('Please assign at least one branch.');
      return;
    }

    setSaving(true);
    try {
      const rolePerms = getDefaultPermissionsForRole(form.role);
      const data = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        branchIds: form.branchIds,
        phone: form.phone || '',
        permissions: rolePerms,
        status: form.status,
      };
      if (form.password.trim()) data.password = form.password.trim();

      if (editUser) {
        await updateStaff(editUser.id, data);
        setShowModal(false);
      } else {
        const result = await addStaff(data);
        setShowModal(false);
        setCredentialsModal({
          name: form.name.trim(),
          email: form.email.trim(),
          tempPassword: result.tempPassword,
          emailSent: result.emailSent,
          loginUrl: result.loginUrl || `${window.location.origin}/admin`,
        });
      }
    } catch {
      /* toast handled in context */
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async (u, customPassword) => {
    try {
      const res = await resetStaffPassword(u.id, customPassword?.trim() || undefined);
      setResetTarget(null);
      setResetPassword('');
      setCredentialsModal({
        name: u.name,
        email: u.email,
        tempPassword: res.tempPassword,
        emailSent: res.emailSent,
        loginUrl: res.loginUrl || `${window.location.origin}/admin`,
      });
    } catch {
      /* toast handled */
    }
  };

  const toggleBranch = (bId) => setForm(f => ({
    ...f,
    branchIds: f.branchIds.includes(bId)
      ? f.branchIds.filter(x => x !== bId)
      : [...f.branchIds, bId],
  }));

  const togglePerm = (action) => {
    setPermDraft(prev => (
      prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action]
    ));
  };

  const saveCustomPermissions = async () => {
    if (!showPermModal) return;
    await updateStaffPermissions(showPermModal, permDraft);
    setShowPermModal(null);
    setPermEditMode(false);
  };

  const permUser = showPermModal ? userList.find(u => u.id === showPermModal) : null;
  const roleActions = permDraft.length
    ? permDraft
    : (permUser ? getDefaultPermissionsForRole(permUser.role) : []);
  const rolePages = permUser
    ? (PERMISSIONS[permUser.role]?.pages?.includes('*') ? ['all'] : (PERMISSIONS[permUser.role]?.pages || []))
    : [];

  return (
    <div className="page-content">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:18 }}>Staff & Roles</h2>
          <p style={{ fontSize:12, color:'var(--text-m)', marginTop:2 }}>
            {userList.length} members · {userList.filter(u => u.status === 'active').length} active
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={openAdd}>+ Invite Member</button>
      </div>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <select className="input" style={{ width:'auto', padding:'6px 10px', fontSize:12 }} value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          {INVITE_ROLES.map(k => <option key={k} value={k}>{ROLE_LABELS[k]}</option>)}
        </select>
        <select className="input" style={{ width:'auto', padding:'6px 10px', fontSize:12 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
          <option value="inactive">Inactive</option>
        </select>
        <span style={{ fontSize:12, color:'var(--text-m)', alignSelf:'center', marginLeft:'auto' }}>{filtered.length} shown</span>
      </div>

      <div className="grid3">
        {filtered.map((s, i) => (
          <div key={s.id} className="card fade-up" style={{ animationDelay:`${i*50}ms`, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:`${s.color}22`, border:`2px solid ${s.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:14, color:s.color, flexShrink:0 }}>{s.avatar}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:14 }}>{s.name}</div>
                <div style={{ fontSize:11, color:'var(--text-m)', marginTop:1 }}>{ROLE_LABELS[s.role] || s.role}</div>
              </div>
              <span className={`badge badge-${s.status === 'active' ? 'green' : s.status === 'blocked' ? 'red' : 'gray'}`}>
                {ACCOUNT_STATUS_LABELS[s.status] || s.status}
              </span>
            </div>
            <div>
              <div style={{ fontSize:11, color:'var(--text-m)' }}>{s.email}</div>
              {s.branchIds?.length > 0 && (
                <div style={{ fontSize:11, color:'var(--text-m)', marginTop:3 }}>{s.branchIds.length} branch access</div>
              )}
              <div style={{ fontSize:10, color:'var(--text-m)', marginTop:3 }}>
                Joined {s.createdAt ? new Date(s.createdAt).toLocaleDateString('en', { month:'short', year:'numeric' }) : '—'}
              </div>
              <div style={{ marginTop:8, display:'flex', gap:6, flexWrap:'wrap' }}>
                <span className="badge badge-gray" style={{ fontSize:9 }}>
                  {(s.permissions?.length || getDefaultPermissionsForRole(s.role).length)} permissions
                </span>
              </div>
            </div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              <button type="button" className="btn btn-ghost" style={{ flex:1, justifyContent:'center', fontSize:11, minWidth:90 }} onClick={() => openPermissions(s)}>Permissions</button>
              <button type="button" className="btn btn-ghost" style={{ flex:1, justifyContent:'center', fontSize:11, minWidth:90 }} onClick={() => openEdit(s)}>Edit</button>
              <button type="button" className="btn btn-ghost" style={{ flex:1, justifyContent:'center', fontSize:11, minWidth:90 }} onClick={() => { setResetTarget(u); setResetPassword(''); }}>Reset Pwd</button>
              <button type="button" className="btn btn-danger" style={{ flex:1, justifyContent:'center', fontSize:11, minWidth:90 }} onClick={() => removeStaff(s.id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card" style={{ textAlign:'center', padding:40, color:'var(--text-m)', fontSize:13 }}>
          No staff members yet. Click <strong>+ Invite Member</strong> to add your first team member.
        </div>
      )}

      <CredentialsModal data={credentialsModal} onClose={() => setCredentialsModal(null)} />

      {resetTarget && (
        <Modal title={`Reset Password — ${resetTarget.name}`} onClose={() => setResetTarget(null)} maxWidth={420}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <p style={{ fontSize:12, color:'var(--text-m)' }}>
              Leave blank to auto-generate a password, or set one manually below.
            </p>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase' }}>New Password (optional)</div>
              <input className="input" type="text" value={resetPassword} onChange={e => setResetPassword(e.target.value)} placeholder="Min 6 characters" />
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button type="button" className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={() => handleResetPassword(resetTarget, resetPassword)}>
                Reset Password
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setResetTarget(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      {showPermModal && permUser && (
        <Modal title={`Permissions — ${permUser.name}`} onClose={() => setShowPermModal(null)} maxWidth={620}>
          <div style={{ marginBottom:14 }}>
            <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:14, flexWrap:'wrap' }}>
              <div style={{ width:38, height:38, borderRadius:10, background:`${permUser.color}22`, border:`2px solid ${permUser.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, color:permUser.color }}>{permUser.avatar}</div>
              <div>
                <div style={{ fontWeight:700 }}>{permUser.name}</div>
                <span className={`badge badge-${ROLE_COLORS[permUser.role] || 'gray'}`}>{ROLE_LABELS[permUser.role] || permUser.role}</span>
              </div>
              {(currentUser?.role === ROLES.CLIENT_ADMIN || currentUser?.role === 'client_admin') && (
                <button type="button" className="btn btn-ghost" style={{ marginLeft:'auto', fontSize:11 }} onClick={() => setPermEditMode(v => !v)}>
                  {permEditMode ? 'View Only' : 'Edit Permissions'}
                </button>
              )}
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:800, color:'var(--text-m)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Page Access</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {rolePages.includes('all')
                  ? <span className="badge badge-green">All Pages</span>
                  : rolePages.map(pg => (
                    <span key={pg} className="badge badge-blue" style={{ textTransform:'capitalize' }}>{pg}</span>
                  ))}
              </div>
            </div>

            <div style={{ fontSize:11, fontWeight:800, color:'var(--text-m)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Action Permissions</div>
            <div style={{ display:'flex', flexDirection:'column', gap:12, maxHeight:360, overflowY:'auto' }}>
              {Object.entries(ACTION_GROUPS).map(([groupName, groupActions]) => (
                <div key={groupName}>
                  <div style={{ fontSize:11, fontWeight:700, color:'var(--text-s)', marginBottom:6 }}>{groupName}</div>
                  <div className="grid-form-2" style={{ gap:4 }}>
                    {groupActions.map(action => {
                      const isAllowed = roleActions.includes(action);
                      return (
                        <button
                          key={action}
                          type="button"
                          disabled={!permEditMode}
                          onClick={() => permEditMode && togglePerm(action)}
                          style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', borderRadius:'var(--r)', background:'var(--elevated)', opacity: isAllowed ? 1 : 0.45, border:'1px solid var(--border)', cursor: permEditMode ? 'pointer' : 'default', textAlign:'left' }}
                        >
                          <span style={{ width:14, height:14, borderRadius:3, background: isAllowed ? 'var(--green)' : 'var(--border)', border:`1px solid ${isAllowed ? 'var(--green)' : 'var(--border)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                            {isAllowed && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20,6 9,17 4,12"/></svg>}
                          </span>
                          <span style={{ fontSize:11, color: isAllowed ? 'var(--text-s)' : 'var(--text-m)' }}>{ACTION_LABELS[action] || action}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:4, flexWrap:'wrap' }}>
            {permEditMode && (
              <button type="button" className="btn btn-primary" style={{ flex:1, justifyContent:'center', minWidth:140 }} onClick={saveCustomPermissions}>
                Save Permissions
              </button>
            )}
            <button type="button" className="btn btn-ghost" style={{ flex:1, justifyContent:'center', minWidth:100 }} onClick={() => { openEdit(permUser); setShowPermModal(null); }}>Edit Role</button>
            <button type="button" className="btn btn-ghost" onClick={() => setShowPermModal(null)}>Close</button>
          </div>
        </Modal>
      )}

      {showModal && (
        <Modal title={editUser ? 'Edit Team Member' : 'Invite Team Member'} onClose={() => setShowModal(false)}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="grid-form-2">
              <div className="span-full">
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Full Name *</div>
                <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" />
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Email *</div>
                <input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="name@example.com" disabled={!!editUser} />
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Phone</div>
                <input className="input" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+92 300…" />
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Role *</div>
                <select className="input" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  {INVITE_ROLES.map(k => <option key={k} value={k}>{ROLE_LABELS[k]}</option>)}
                </select>
              </div>
              {editUser && (
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Account Status</div>
                  <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}
            </div>

            {form.role && (
              <div style={{ background:'var(--elevated)', borderRadius:'var(--r)', padding:'12px 14px' }}>
                <div style={{ fontSize:11, fontWeight:700, marginBottom:8, color:'var(--text-s)' }}>
                  Role Preview — {ROLE_LABELS[form.role]}
                </div>
                <div style={{ fontSize:10, color:'var(--text-m)' }}>
                  {getDefaultPermissionsForRole(form.role).length} permissions will be assigned automatically.
                </div>
              </div>
            )}

            {branches.length > 0 && (
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.06em' }}>Branch Access *</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                  {branches.map(b => (
                    <button key={b.id} type="button" onClick={() => toggleBranch(b.id)}
                      style={{ padding:'5px 12px', borderRadius:99, fontSize:11, fontWeight:600, cursor:'pointer', border:'1px solid', transition:'.12s', borderColor: form.branchIds.includes(b.id) ? 'var(--accent)' : 'var(--border)', background: form.branchIds.includes(b.id) ? 'var(--accent-soft)' : 'var(--elevated)', color: form.branchIds.includes(b.id) ? 'var(--accent)' : 'var(--text-s)' }}>
                      {b.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!editUser && (
              <>
                <div>
                  <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Password</div>
                  <input className="input" type="text" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Set manually (min 6 chars) or leave blank to auto-generate" />
                </div>
                <div style={{ background:'var(--elevated)', borderRadius:'var(--r)', padding:'10px 14px', fontSize:11, color:'var(--text-m)' }}>
                  After creating, the password appears on screen to copy. Email is sent automatically if SMTP is configured on the server.
                </div>
              </>
            )}

            <div style={{ display:'flex', gap:10, marginTop:4, flexWrap:'wrap' }}>
              <button type="button" className="btn btn-primary" style={{ flex:1, justifyContent:'center', minWidth:140 }} onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : (editUser ? 'Save Changes' : 'Create Staff Account')}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
