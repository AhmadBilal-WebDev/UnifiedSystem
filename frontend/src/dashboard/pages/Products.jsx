import React, { useState, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { fmt, SectionHeader, Modal } from '../components/ui';
import { ALLERGENS_LIST, STOCK_OPTIONS } from '../data/mockData';

const API_BASE = 'http://localhost:5000';

function ImageUploader({ value, onChange, type = 'products' }) {
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
      const res = await fetch(`${API_BASE}/api/upload?type=${type}`, { method: 'POST', body: formData });
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
        Product Image
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:64, height:64, borderRadius:12, background:'var(--elevated)', border:'2px dashed var(--border)', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
          {preview
            ? <img src={preview} alt="preview" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            : <span style={{ fontSize:10, color:'var(--text-m)', textAlign:'center', padding:4 }}>No image</span>
          }
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <button type="button" className="btn btn-ghost" style={{ fontSize:11 }}
            onClick={() => fileRef.current.click()} disabled={uploading}>
            {uploading ? 'Uploading...' : '📁 Upload Image'}
          </button>
          {preview && (
            <button type="button" className="btn btn-ghost" style={{ fontSize:11, color:'var(--red)' }}
              onClick={() => { setPreview(null); onChange(''); }}>
              Remove
            </button>
          )}
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile}/>
    </div>
  );
}

/**
 * Reusable editor for Sizes / Addons / Extras — each is a list of
 * { name, price } the customer picks from on the website's product modal.
 */
function OptionListEditor({ label, hint, items, onChange }) {
  const addRow = () => onChange([...items, { name: '', price: '' }]);
  const updateRow = (i, field, val) => {
    const next = items.slice();
    next[i] = { ...next[i], [field]: val };
    onChange(next);
  };
  const removeRow = (i) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <div style={{ gridColumn: '1/-1' }}>
      <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:8 }}>
        <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', textTransform:'uppercase', letterSpacing:'.06em' }}>
          {label}
        </div>
        <span style={{ fontSize:10, color:'var(--text-m)' }}>{hint}</span>
      </div>

      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {items.map((row, i) => (
          <div key={i} style={{ display:'flex', gap:6, alignItems:'center' }}>
            <input
              className="input"
              style={{ flex:2 }}
              placeholder="Name (e.g. Large, Extra Cheese)"
              value={row.name}
              onChange={e => updateRow(i, 'name', e.target.value)}
            />
            <input
              className="input"
              type="number"
              style={{ flex:1 }}
              placeholder="Price"
              value={row.price}
              onChange={e => updateRow(i, 'price', e.target.value)}
            />
            <button type="button" className="btn btn-ghost" style={{ fontSize:11, color:'var(--red)', padding:'7px 10px' }}
              onClick={() => removeRow(i)}>
              ✕
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-ghost" style={{ fontSize:11, marginTop:8 }} onClick={addRow}>
        + Add {label.replace(/s$/, '')}
      </button>
    </div>
  );
}

const emptyForm = (defaultCategoryId = '') => ({
  name:'', description:'', price:'', cost:'', categoryId: defaultCategoryId, image:'', sku:'',
  tags:[], calories:'', prepTime:'', active:true, featured:false, stock:'unlimited', allergens:[],
  sizes: [], addons: [], extras: [],
  applyToAllBranches: false,
});

export default function Products() {
  const {
    productList, toggleProductStatus, deleteProduct, addProduct, updateProduct,
    categoryList, getClientProducts, currentUser, branchList,
  } = useApp();
  const prods = getClientProducts();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyForm());

  // Only show branch-targeting controls if this account manages more than one branch
  const hasMultipleBranches = (currentUser?.branchIds?.length || 0) > 1 || (branchList?.length || 0) > 1;

  const filtered = prods.filter(p => {
    if (catFilter !== 'all' && p.categoryId !== catFilter) return false;
    if (statusFilter === 'active' && !p.active) return false;
    if (statusFilter === 'inactive' && p.active) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.sku?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openAdd = () => {
    setEditProduct(null);
    setForm(emptyForm(categoryList[0]?.id || ''));
    setShowModal(true);
  };
  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name:p.name, description:p.description||'', price:String(p.price), cost:String(p.cost||0),
      categoryId:p.categoryId||'', image:p.image||'', sku:p.sku||'', tags:p.tags||[],
      calories:String(p.calories||''), prepTime:String(p.prepTime||''), active:p.active,
      featured:p.featured||false, stock:p.stock||'unlimited', allergens:p.allergens||[],
      sizes: p.sizes || [], addons: p.addons || [], extras: p.extras || [],
      applyToAllBranches: !p.branchId,
    });
    setShowModal(true);
  };
  const cleanOptionRows = (rows) =>
    rows
      .filter(r => r.name.trim())
      .map(r => ({ name: r.name.trim(), price: parseFloat(r.price) || 0 }));

  const handleSave = () => {
    if (!form.name || !form.price) return;
    const data = {
      ...form,
      price:parseFloat(form.price), cost:parseFloat(form.cost||0),
      calories:parseInt(form.calories||0), prepTime:parseInt(form.prepTime||5),
      sizes: cleanOptionRows(form.sizes),
      addons: cleanOptionRows(form.addons),
      extras: cleanOptionRows(form.extras),
    };
    if (editProduct) { updateProduct(editProduct.id, data); }
    else { addProduct(data); }
    setShowModal(false);
  };
  const toggleAllergen = (a) => setForm(f => ({ ...f, allergens: f.allergens.includes(a) ? f.allergens.filter(x=>x!==a) : [...f.allergens, a] }));
  const toggleTag = (t) => setForm(f => ({ ...f, tags: f.tags.includes(t) ? f.tags.filter(x=>x!==t) : [...f.tags, t] }));

  return (
    <div style={{ padding:24, display:'flex', flexDirection:'column', gap:20 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:18 }}>Menu & Products</h2>
          <p style={{ fontSize:12, color:'var(--text-m)', marginTop:2 }}>{prods.filter(p=>p.active).length} active · {prods.filter(p=>!p.active).length} inactive · {prods.length} total</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <input className="input" style={{ maxWidth:240 }} placeholder="Search by name or SKU..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select className="input" style={{ width:'auto', padding:'6px 10px', fontSize:12 }} value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {categoryList.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="input" style={{ width:'auto', padding:'6px 10px', fontSize:12 }} value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
        <span style={{ fontSize:12, color:'var(--text-m)', marginLeft:'auto' }}>{filtered.length} shown</span>
      </div>

      <div className="grid3">
        {filtered.map((p,i) => {
          const margin = p.cost>0 ? Math.round(((p.price-p.cost)/p.price)*100) : 0;
          const cat = categoryList.find(c=>c.id===p.categoryId);
          const imgSrc = p.image && p.image.startsWith('http') ? p.image : (p.image ? `${API_BASE}${p.image}` : null);
          return (
            <div key={p.id} className="card fade-up" style={{ animationDelay:`${i*40}ms`, display:'flex', flexDirection:'column', gap:12, opacity:p.active?1:.55 }}>
              <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                <div style={{ width:50, height:50, borderRadius:12, background:'var(--elevated)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color:'var(--accent)', flexShrink:0, border:'1px solid var(--border)', overflow:'hidden' }}>
                  {imgSrc
                    ? <img src={imgSrc} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    : (p.name?.slice(0,2)||'?')
                  }
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:13 }}>{p.name}</div>
                  <div style={{ display:'flex', gap:5, marginTop:4, flexWrap:'wrap' }}>
                    {cat && <span className="badge badge-gray" style={{ fontSize:9 }}>{cat.name}</span>}
                    <span className={`badge badge-${p.active?'green':'red'}`} style={{ fontSize:9 }}>{p.active?'Active':'Off'}</span>
                    {p.featured && <span className="badge badge-yellow" style={{ fontSize:9 }}>Featured</span>}
                    {!p.branchId && <span className="badge badge-blue" style={{ fontSize:9 }}>All Branches</span>}
                    {p.tags?.map(t=><span key={t} className="badge badge-gray" style={{ fontSize:9, textTransform:'capitalize' }}>{t}</span>)}
                  </div>
                </div>
                <label className="toggle" onClick={e=>e.stopPropagation()}><input type="checkbox" checked={p.active} onChange={()=>toggleProductStatus(p.id)}/><span className="toggle-slider"/></label>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[
                  { l:'Price', v:`PKR ${p.price?.toLocaleString()}` },
                  { l:'Cost',  v:`PKR ${p.cost?.toLocaleString()}` },
                  { l:'Margin', v:`${margin}%`, color: margin>60?'var(--green)':margin>40?'var(--yellow)':'var(--red)' },
                  { l:'Sold', v: p.sold||0 },
                ].map(m=>(
                  <div key={m.l} style={{ background:'var(--elevated)', borderRadius:'var(--r)', padding:'8px 10px' }}>
                    <div style={{ fontSize:9, color:'var(--text-m)', textTransform:'uppercase', letterSpacing:'.05em', fontWeight:700 }}>{m.l}</div>
                    <div style={{ fontWeight:800, fontSize:13, marginTop:2, color:m.color||'var(--text)' }}>{m.v}</div>
                  </div>
                ))}
              </div>
              {p.description && <div style={{ fontSize:11, color:'var(--text-m)', lineHeight:1.5 }}>{p.description}</div>}
              {(p.sizes?.length || p.addons?.length || p.extras?.length) ? (
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', fontSize:10, color:'var(--text-m)' }}>
                  {p.sizes?.length  ? <span className="badge badge-gray" style={{fontSize:9}}>{p.sizes.length} sizes</span>  : null}
                  {p.addons?.length ? <span className="badge badge-gray" style={{fontSize:9}}>{p.addons.length} addons</span> : null}
                  {p.extras?.length ? <span className="badge badge-gray" style={{fontSize:9}}>{p.extras.length} extras</span> : null}
                </div>
              ) : null}
              {p.sku && <div style={{ fontSize:10, color:'var(--text-m)', fontFamily:"'JetBrains Mono',monospace" }}>SKU: {p.sku}</div>}
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-ghost" style={{ flex:1, justifyContent:'center', fontSize:11 }} onClick={()=>openEdit(p)}>Edit</button>
                <button className="btn btn-danger" style={{ flex:1, justifyContent:'center', fontSize:11 }} onClick={()=>deleteProduct(p.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <Modal title={editProduct ? 'Edit Product' : 'Add New Product'} onClose={()=>setShowModal(false)} maxWidth={620}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div style={{ gridColumn:'1/-1' }}>
              <ImageUploader value={form.image} onChange={v=>setForm(f=>({...f,image:v}))} type="products"/>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Product Name *</div>
              <input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Spicy Chicken Burger"/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Category *</div>
              <select className="input" value={form.categoryId} onChange={e=>setForm(f=>({...f,categoryId:e.target.value}))}>
                <option value="">Select category</option>
                {categoryList.map(c=><option key={c.id} value={c.id}>{c.name}{!c.branchId ? ' (All Branches)' : ''}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>SKU</div>
              <input className="input" value={form.sku} onChange={e=>setForm(f=>({...f,sku:e.target.value}))} placeholder="e.g. BRG-001"/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Price (PKR) *</div>
              <input className="input" type="number" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))} placeholder="0"/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Cost (PKR)</div>
              <input className="input" type="number" value={form.cost} onChange={e=>setForm(f=>({...f,cost:e.target.value}))} placeholder="0"/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Calories</div>
              <input className="input" type="number" value={form.calories} onChange={e=>setForm(f=>({...f,calories:e.target.value}))} placeholder="0"/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Prep Time (min)</div>
              <input className="input" type="number" value={form.prepTime} onChange={e=>setForm(f=>({...f,prepTime:e.target.value}))} placeholder="5"/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Stock Status</div>
              <select className="input" value={form.stock} onChange={e=>setForm(f=>({...f,stock:e.target.value}))}>
                <option value="unlimited">Unlimited</option>
                <option value="limited">Limited</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Description</div>
              <input className="input" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Short product description"/>
            </div>

            {/* ── Sizes / Addons / Extras ─────────────────────────────── */}
            <OptionListEditor
              label="Sizes" hint="e.g. Small / Medium / Large, each with its own price"
              items={form.sizes} onChange={v=>setForm(f=>({...f,sizes:v}))}
            />
            <OptionListEditor
              label="Addons" hint="extra items the customer can add (e.g. Extra Patty)"
              items={form.addons} onChange={v=>setForm(f=>({...f,addons:v}))}
            />
            <OptionListEditor
              label="Extras" hint="free or paid extras (e.g. Extra Cheese, Ketchup)"
              items={form.extras} onChange={v=>setForm(f=>({...f,extras:v}))}
            />

            <div style={{ gridColumn:'1/-1' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.06em' }}>Allergens</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {ALLERGENS_LIST.map(a=>(
                  <button key={a} onClick={()=>toggleAllergen(a)}
                    style={{ padding:'4px 10px', borderRadius:99, fontSize:11, fontWeight:600, cursor:'pointer', border:'1px solid', borderColor:form.allergens.includes(a)?'var(--red)':'var(--border)', background:form.allergens.includes(a)?'var(--red-soft)':'var(--elevated)', color:form.allergens.includes(a)?'var(--red)':'var(--text-s)', textTransform:'capitalize', transition:'.12s' }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.06em' }}>Tags</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {['bestseller','popular','new','premium','vegan','spicy','value'].map(t=>(
                  <button key={t} onClick={()=>toggleTag(t)}
                    style={{ padding:'4px 10px', borderRadius:99, fontSize:11, fontWeight:600, cursor:'pointer', border:'1px solid', borderColor:form.tags.includes(t)?'var(--accent)':'var(--border)', background:form.tags.includes(t)?'var(--accent-soft)':'var(--elevated)', color:form.tags.includes(t)?'var(--accent)':'var(--text-s)', textTransform:'capitalize', transition:'.12s' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {hasMultipleBranches && (
              <div style={{ gridColumn:'1/-1', background:'var(--elevated)', borderRadius:'var(--r)', padding:'10px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700 }}>Show on all branches</div>
                  <div style={{ fontSize:10, color:'var(--text-m)', marginTop:2 }}>
                    {form.applyToAllBranches ? 'This product will appear on every branch.' : 'This product will only appear on your current branch.'}
                  </div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={form.applyToAllBranches} onChange={e=>setForm(f=>({...f,applyToAllBranches:e.target.checked}))}/>
                  <span className="toggle-slider"/>
                </label>
              </div>
            )}

            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, cursor:'pointer' }}>
                <input type="checkbox" checked={form.active} onChange={e=>setForm(f=>({...f,active:e.target.checked}))}/>Active
              </label>
              <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, cursor:'pointer' }}>
                <input type="checkbox" checked={form.featured} onChange={e=>setForm(f=>({...f,featured:e.target.checked}))}/>Featured
              </label>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:18 }}>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={handleSave}>{editProduct ? 'Save Changes' : 'Add Product'}</button>
            <button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
