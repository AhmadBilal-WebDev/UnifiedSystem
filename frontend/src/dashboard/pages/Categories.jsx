import React, { useState, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { SectionHeader, Modal } from '../components/ui';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const COLOR_OPTIONS = ['#f97316','#eab308','#3b82f6','#ec4899','#22c55e','#a855f7','#ef4444','#06b6d4','#f59e0b','#10b981'];

function BannerUploader({ value, onChange }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value && value.startsWith('http') ? value : (value ? `${API_BASE}${value}` : null));

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await fetch(`${API_BASE}/api/upload?type=categories`, { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        const fullUrl = `${API_BASE}${data.imageUrl}`;
        setPreview(fullUrl);
        onChange(fullUrl);
      } else {
        alert('Upload failed: ' + data.message);
      }
    } catch (err) {
      alert('Upload error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', textTransform:'uppercase', letterSpacing:'.06em' }}>
        Banner Image (optional)
      </div>
      <div style={{ width:'100%', height:100, borderRadius:12, background:'var(--elevated)', border:'2px dashed var(--border)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
        {preview
          ? <img src={preview} alt="banner" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
          : <span style={{ fontSize:11, color:'var(--text-m)' }}>No banner image</span>
        }
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <button type="button" className="btn btn-ghost" style={{ fontSize:11 }}
          onClick={() => fileRef.current.click()} disabled={uploading}>
          {uploading ? 'Uploading...' : '📁 Upload Banner'}
        </button>
        {preview && (
          <button type="button" className="btn btn-ghost" style={{ fontSize:11, color:'var(--red)' }}
            onClick={() => { setPreview(null); onChange(''); }}>
            Remove
          </button>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile}/>
    </div>
  );
}

export default function Categories() {
  const { categoryList, addCategory, updateCategory, deleteCategory, currentUser, branchList } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name:'', icon:'', color:'#f97316', sortOrder:'', active:true, bannerImg:'', applyToAllBranches:false });

  const hasMultipleBranches = (currentUser?.branchIds?.length || 0) > 1 || (branchList?.length || 0) > 1;

  const openAdd = () => {
    setEditCat(null);
    setForm({ name:'', icon:'', color:'#f97316', sortOrder:String(categoryList.length+1), active:true, bannerImg:'', applyToAllBranches:false });
    setShowModal(true);
  };
  const openEdit = (c) => {
    setEditCat(c);
    setForm({ name:c.name, icon:c.icon||'', color:c.color||'#f97316', sortOrder:String(c.sortOrder||1), active:c.active, bannerImg:c.bannerImg||'', applyToAllBranches: !c.branchId });
    setShowModal(true);
  };
  const handleSave = () => {
    if (!form.name) return;
    const data = { ...form, sortOrder:parseInt(form.sortOrder||1) };
    if (editCat) { updateCategory(editCat.id, data); }
    else { addCategory(data); }
    setShowModal(false);
  };

  return (
    <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:18 }}>Categories</h2>
          <p style={{ fontSize:12, color:'var(--text-m)', marginTop:2 }}>{categoryList.filter(c=>c.active).length} active · {categoryList.length} total</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Category</button>
      </div>

      <div className="grid3">
        {[...categoryList].sort((a,b)=>a.sortOrder-b.sortOrder).map((c,i) => {
          const bannerSrc = c.bannerImg && c.bannerImg.startsWith('http') ? c.bannerImg : (c.bannerImg ? `${API_BASE}${c.bannerImg}` : null);
          return (
          <div key={c.id} className="card fade-up" style={{ animationDelay:`${i*40}ms`, opacity:c.active?1:.55, borderLeft:`3px solid ${c.color}`, padding:0, overflow:'hidden' }}>
            {bannerSrc && (
              <div style={{ width:'100%', height:80, overflow:'hidden' }}>
                <img src={bannerSrc} alt={c.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
              </div>
            )}
            <div style={{ padding:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
                <div style={{ width:44, height:44, borderRadius:12, background:`${c.color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:14, color:c.color, border:`1px solid ${c.color}44`, flexShrink:0 }}>
                  {c.icon || c.name.slice(0,2)}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>{c.name}</div>
                  <div style={{ fontSize:11, color:'var(--text-m)' }}>Sort order: {c.sortOrder}</div>
                </div>
                <span className={`badge badge-${c.active?'green':'gray'}`}>{c.active?'Active':'Off'}</span>
              </div>
              {!c.branchId && (
                <div style={{ marginBottom:12 }}>
                  <span className="badge badge-blue" style={{ fontSize:9 }}>All Branches</span>
                </div>
              )}
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-ghost" style={{ flex:1, justifyContent:'center', fontSize:11 }} onClick={()=>openEdit(c)}>Edit</button>
                <button className="btn btn-ghost" style={{ flex:1, justifyContent:'center', fontSize:11 }} onClick={()=>updateCategory(c.id,{active:!c.active})}>{c.active?'Disable':'Enable'}</button>
                <button className="btn btn-danger" style={{ flex:1, justifyContent:'center', fontSize:11 }} onClick={()=>deleteCategory(c.id)}>Delete</button>
              </div>
            </div>
          </div>
        )})}
      </div>

      {showModal && (
        <Modal title={editCat ? 'Edit Category' : 'Add Category'} onClose={()=>setShowModal(false)}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <BannerUploader value={form.bannerImg} onChange={v=>setForm(f=>({...f,bannerImg:v}))}/>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Category Name *</div>
              <input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Burgers"/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Icon / Abbreviation</div>
                <input className="input" value={form.icon} onChange={e=>setForm(f=>({...f,icon:e.target.value}))} placeholder="e.g. B or BRG"/>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Sort Order</div>
                <input className="input" type="number" value={form.sortOrder} onChange={e=>setForm(f=>({...f,sortOrder:e.target.value}))}/>
              </div>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.06em' }}>Color</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {COLOR_OPTIONS.map(c=>(
                  <div key={c} onClick={()=>setForm(f=>({...f,color:c}))}
                    style={{ width:32, height:32, borderRadius:8, background:c, cursor:'pointer', border:`3px solid ${form.color===c?'var(--text)':'transparent'}`, transition:'.1s' }}/>
                ))}
              </div>
            </div>

            {hasMultipleBranches && (
              <div style={{ background:'var(--elevated)', borderRadius:'var(--r)', padding:'10px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700 }}>Show on all branches</div>
                  <div style={{ fontSize:10, color:'var(--text-m)', marginTop:2 }}>
                    {form.applyToAllBranches ? 'This category will appear on every branch.' : 'This category will only appear on your current branch.'}
                  </div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={form.applyToAllBranches} onChange={e=>setForm(f=>({...f,applyToAllBranches:e.target.checked}))}/>
                  <span className="toggle-slider"/>
                </label>
              </div>
            )}

            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <label className="toggle"><input type="checkbox" checked={form.active} onChange={e=>setForm(f=>({...f,active:e.target.checked}))}/><span className="toggle-slider"/></label>
              <span style={{ fontSize:13, fontWeight:600 }}>Active</span>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:4 }}>
              <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={handleSave}>{editCat ? 'Save Changes' : 'Add Category'}</button>
              <button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
