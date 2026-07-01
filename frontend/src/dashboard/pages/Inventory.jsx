import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { SectionHeader, Modal } from '../components/ui';

const UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'boxes', 'bags', 'bottles', 'cans'];
const CATEGORIES = ['Meat', 'Poultry', 'Seafood', 'Dairy', 'Bread', 'Produce', 'Frozen', 'Oil', 'Beverages', 'Spices', 'Packaging', 'Other'];
const SUPPLIERS = ['FreshMeat Co.', 'Bakers Plus', 'DairyFarm Co.', 'OilsRUs', 'FarmFresh', 'BevCo', 'FrozenPro', 'SpiceWorld', 'Local Market', 'Other'];

export default function Inventory() {
  const { inventoryList, updateInventory, addInventory, getAccessibleBranches, activeBranchId, addToast } = useApp();
  const branches = getAccessibleBranches();
  const [branchFilter, setBranchFilter] = useState(activeBranchId || 'all');
  const [catFilter, setCatFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name:'', unit:'kg', quantity:'', reorderPoint:'', reorderQty:'', cost:'', supplier:'', category:'Meat', branchId:activeBranchId||'' });

  const visible = inventoryList.filter(i => {
    if (branchFilter !== 'all' && i.branchId !== branchFilter) return false;
    if (catFilter !== 'all' && i.category !== catFilter) return false;
    if (stockFilter === 'low' && i.quantity >= i.reorderPoint) return false;
    if (stockFilter === 'ok' && i.quantity < i.reorderPoint) return false;
    return true;
  });

  const lowStock = inventoryList.filter(i => i.quantity < i.reorderPoint);

  const openAdd = () => {
    setEditItem(null);
    setForm({ name:'', unit:'kg', quantity:'', reorderPoint:'', reorderQty:'', cost:'', supplier:SUPPLIERS[0], category:'Meat', branchId:activeBranchId||branches[0]?.id||'' });
    setShowModal(true);
  };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name:item.name, unit:item.unit, quantity:String(item.quantity), reorderPoint:String(item.reorderPoint), reorderQty:String(item.reorderQty), cost:String(item.cost||''), supplier:item.supplier||'', category:item.category||'Other', branchId:item.branchId||'' });
    setShowModal(true);
  };
  const handleSave = () => {
    if (!form.name || !form.branchId) return;
    const data = { ...form, quantity:parseFloat(form.quantity||0), reorderPoint:parseFloat(form.reorderPoint||0), reorderQty:parseFloat(form.reorderQty||0), cost:parseFloat(form.cost||0) };
    if (editItem) { updateInventory(editItem.id, data); }
    else { addInventory(data); }
    setShowModal(false);
  };

  const getStockStatus = (item) => {
    const ratio = item.quantity / item.reorderPoint;
    if (item.quantity === 0) return { label:'Out of Stock', color:'var(--red)', bg:'var(--red-soft)' };
    if (ratio < 1) return { label:'Low Stock', color:'var(--yellow)', bg:'var(--yellow-soft)' };
    if (ratio < 1.5) return { label:'Moderate', color:'var(--blue)', bg:'var(--blue-soft)' };
    return { label:'In Stock', color:'var(--green)', bg:'var(--green-soft)' };
  };

  return (
    <div className="page-content">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <div>
          <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:18 }}>Inventory</h2>
          <p style={{ fontSize:12, color:'var(--text-m)', marginTop:2 }}>{visible.length} items · {lowStock.length} low stock alerts</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Item</button>
      </div>

      {lowStock.length > 0 && (
        <div style={{ background:'var(--yellow-soft)', border:'1px solid rgba(234,179,8,.33)', borderRadius:'var(--r)', padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <span style={{ fontSize:12, fontWeight:600, color:'var(--yellow)' }}>{lowStock.length} item{lowStock.length>1?'s':''} below reorder point:</span>
          <span style={{ fontSize:12, color:'var(--text-m)' }}>{lowStock.map(i=>i.name).join(', ')}</span>
        </div>
      )}

      <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
        <select className="input" style={{ width:'auto', padding:'6px 10px', fontSize:12 }} value={branchFilter} onChange={e=>setBranchFilter(e.target.value)}>
          <option value="all">All Branches</option>
          {branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select className="input" style={{ width:'auto', padding:'6px 10px', fontSize:12 }} value={catFilter} onChange={e=>setCatFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c=><option key={c}>{c}</option>)}
        </select>
        <select className="input" style={{ width:'auto', padding:'6px 10px', fontSize:12 }} value={stockFilter} onChange={e=>setStockFilter(e.target.value)}>
          <option value="all">All Stock Levels</option>
          <option value="low">Low Stock Only</option>
          <option value="ok">OK Stock</option>
        </select>
      </div>

      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        <table className="table">
          <thead>
            <tr><th>Item</th><th>Category</th><th>Branch</th><th>Quantity</th><th>Reorder At</th><th>Cost/Unit</th><th>Supplier</th><th>Restocked</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {visible.map(item => {
              const st = getStockStatus(item);
              const branchName = branches.find(b=>b.id===item.branchId)?.name || item.branchId;
              return (
                <tr key={item.id}>
                  <td><div style={{ fontWeight:700 }}>{item.name}</div></td>
                  <td><span className="badge badge-gray">{item.category}</span></td>
                  <td style={{ fontSize:12, color:'var(--text-s)' }}>{branchName}</td>
                  <td>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700, color:item.quantity<item.reorderPoint?'var(--red)':'var(--text)' }}>
                      {item.quantity} {item.unit}
                    </span>
                  </td>
                  <td style={{ fontSize:12, color:'var(--text-m)' }}>{item.reorderPoint} {item.unit}</td>
                  <td style={{ fontSize:12 }}>PKR {item.cost?.toLocaleString()}</td>
                  <td style={{ fontSize:12, color:'var(--text-s)' }}>{item.supplier}</td>
                  <td style={{ fontSize:11, color:'var(--text-m)' }}>{item.lastRestocked}</td>
                  <td>
                    <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:99, background:st.bg, color:st.color }}>{st.label}</span>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:4 }}>
                      <button className="btn btn-ghost" style={{ fontSize:10, padding:'3px 8px' }} onClick={()=>openEdit(item)}>Edit</button>
                      <button className="btn btn-ghost" style={{ fontSize:10, padding:'3px 8px', color:'var(--blue)' }} onClick={()=>{ updateInventory(item.id, {quantity:item.quantity+item.reorderQty, lastRestocked:new Date().toISOString().split('T')[0]}); addToast(`Restocked ${item.name}!`,'success'); }}>Restock</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div style={{ textAlign:'center', padding:'50px', color:'var(--text-m)', fontSize:13 }}>No items found</div>
        )}
      </div>

      {showModal && (
        <Modal title={editItem ? 'Edit Inventory Item' : 'Add Inventory Item'} onClose={()=>setShowModal(false)}>
          <div className="grid-form-2">
            <div style={{ gridColumn:'1/-1' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Item Name *</div>
              <input className="input" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Beef Patty (100g)"/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Branch *</div>
              <select className="input" value={form.branchId} onChange={e=>setForm(f=>({...f,branchId:e.target.value}))}>
                <option value="">Select branch</option>
                {branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Category</div>
              <select className="input" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}>
                {CATEGORIES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Unit</div>
              <select className="input" value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}>
                {UNITS.map(u=><option key={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Current Quantity</div>
              <input className="input" type="number" value={form.quantity} onChange={e=>setForm(f=>({...f,quantity:e.target.value}))}/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Reorder Point</div>
              <input className="input" type="number" value={form.reorderPoint} onChange={e=>setForm(f=>({...f,reorderPoint:e.target.value}))}/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Reorder Qty</div>
              <input className="input" type="number" value={form.reorderQty} onChange={e=>setForm(f=>({...f,reorderQty:e.target.value}))}/>
            </div>
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Cost per Unit (PKR)</div>
              <input className="input" type="number" value={form.cost} onChange={e=>setForm(f=>({...f,cost:e.target.value}))}/>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Supplier</div>
              <select className="input" value={form.supplier} onChange={e=>setForm(f=>({...f,supplier:e.target.value}))}>
                {SUPPLIERS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:'flex', gap:10, marginTop:18 }}>
            <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={handleSave}>{editItem ? 'Save Changes' : 'Add Item'}</button>
            <button className="btn btn-ghost" onClick={()=>setShowModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
