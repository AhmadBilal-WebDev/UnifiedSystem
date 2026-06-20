import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { SectionHeader } from '../components/ui';
import { ROLES, ROLE_LABELS } from '../data/mockData';
import { CURRENCIES, TAX_TYPES, POS_SYSTEMS, PRINTER_MODELS, CITIES, CUISINES } from '../data/mockData';

const NAV = [
  { id:'profile',       label:'Profile'            },
  { id:'notifications', label:'Notifications'      },
  { id:'pos',           label:'POS & Printing'     },
  { id:'payment',       label:'Payment Methods'    },
  { id:'tax',           label:'Tax & Billing'      },
  { id:'branding',      label:'Branding'           },
  { id:'security',      label:'Security'           },
  { id:'api',           label:'API & Integrations' },
  { id:'delivery',      label:'Delivery Zones'     },
];

export default function Settings() {
  const { currentUser, updateStaff, addToast, toggleTheme, theme, branchList, getClientBranches } = useApp();
  const branches = getClientBranches();
  const [section, setSection] = useState('profile');
  const [notifEmail,  setNotifEmail ] = useState(true);
  const [notifSms,    setNotifSms   ] = useState(false);
  const [notifPush,   setNotifPush  ] = useState(true);
  const [notifPOS,    setNotifPOS   ] = useState(true);
  const [autoPrint,   setAutoPrint  ] = useState(true);
  const [printCopies, setPrintCopies] = useState('1');
  const [printerModel,setPrinterModel]= useState(PRINTER_MODELS[0]);
  const [twoFA,       setTwoFA      ] = useState(true);
  const [sessionTO,   setSessionTO  ] = useState(true);
  const [loginNotif,  setLoginNotif ] = useState(false);
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [taxRate,     setTaxRate    ] = useState('16');
  const [taxType,     setTaxType    ] = useState('Exclusive');
  const [currency,    setCurrency   ] = useState('PKR');
  const [profile, setProfile] = useState({ name:currentUser?.name||'', email:currentUser?.email||'', phone:'+92 300 1234567', city:'Karachi', cuisine:'Fast Food' });
  const [paymentMethods, setPaymentMethods] = useState({ cod:true, card:true, jazzcash:true, easypaisa:false, online:false, pos_cash:true });
  const [deliveryZones, setDeliveryZones] = useState([
    { id:'z1', name:'Zone A — City Center', minOrder:500, fee:100, radius:'5 km', active:true },
    { id:'z2', name:'Zone B — Suburbs', minOrder:800, fee:200, radius:'10 km', active:true },
    { id:'z3', name:'Zone C — Extended', minOrder:1200, fee:300, radius:'15 km', active:false },
  ]);

  const saveProfile = () => { if (currentUser) { updateStaff(currentUser.id, { name:profile.name, email:profile.email }); } };
  const togglePayment = (k) => setPaymentMethods(m=>({...m,[k]:!m[k]}));

  return (
    <div style={{ padding:24, display:'flex', gap:24 }}>
      <div style={{ width:190, flexShrink:0 }}>
        <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:14, marginBottom:12 }}>Settings</div>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>setSection(n.id)}
            style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'9px 12px', borderRadius:'var(--r)', marginBottom:2, fontSize:12, fontWeight:section===n.id?700:500, background:section===n.id?'var(--accent-soft)':'none', color:section===n.id?'var(--accent)':'var(--text-s)', border:`1px solid ${section===n.id?'rgba(232,82,26,.35)':'transparent'}`, transition:'.15s', textAlign:'left', cursor:'pointer' }}>
            {n.label}
          </button>
        ))}
      </div>

      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:16, minWidth:0 }}>

        {section==='profile' && (
          <div className="card">
            <SectionHeader title="Profile Settings" sub="Update your personal information"/>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap' }}>
              {[['Full Name','name','text'],['Email','email','email'],['Phone','phone','tel']].map(([l,k,t])=>(
                <div key={k} style={{ flex:'1 1 200px' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>{l}</div>
                  <input className="input" type={t} value={profile[k]||''} onChange={e=>setProfile(p=>({...p,[k]:e.target.value}))}/>
                </div>
              ))}
              <div style={{ flex:'1 1 200px' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>City</div>
                <select className="input" value={profile.city} onChange={e=>setProfile(p=>({...p,city:e.target.value}))}>
                  {CITIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex:'1 1 200px' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Cuisine Type</div>
                <select className="input" value={profile.cuisine} onChange={e=>setProfile(p=>({...p,cuisine:e.target.value}))}>
                  {CUISINES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ flex:'1 1 200px' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Role</div>
                <div style={{ padding:'8px 12px', background:'var(--elevated)', borderRadius:'var(--r)', fontSize:12, color:'var(--text-s)' }}>{ROLE_LABELS[currentUser?.role]||'—'}</div>
              </div>
            </div>
            <div style={{ marginTop:16, display:'flex', gap:10 }}>
              <button className="btn btn-primary" onClick={saveProfile}>Save Changes</button>
              <button className="btn btn-ghost" onClick={()=>setProfile({name:currentUser?.name||'',email:currentUser?.email||'',phone:'+92 300 1234567',city:'Karachi',cuisine:'Fast Food'})}>Reset</button>
            </div>
          </div>
        )}

        {section==='notifications' && (
          <div className="card">
            <SectionHeader title="Notification Preferences" sub="Control how you receive alerts"/>
            {[
              { l:'Email Notifications', d:'Daily summaries and alerts via email',         v:notifEmail, s:setNotifEmail },
              { l:'SMS Alerts',          d:'Urgent text alerts to your registered phone',  v:notifSms,   s:setNotifSms   },
              { l:'Push Notifications',  d:'Browser and mobile app push notifications',    v:notifPush,  s:setNotifPush  },
              { l:'POS Sync Alerts',     d:'Notify when POS terminal loses sync',          v:notifPOS,   s:setNotifPOS   },
            ].map((n,i,arr)=>(
              <div key={n.l} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:i<arr.length-1?'1px solid var(--border)':'none' }}>
                <div><div style={{ fontWeight:600, fontSize:13 }}>{n.l}</div><div style={{ fontSize:11, color:'var(--text-m)', marginTop:2 }}>{n.d}</div></div>
                <label className="toggle"><input type="checkbox" checked={n.v} onChange={e=>n.s(e.target.checked)}/><span className="toggle-slider"/></label>
              </div>
            ))}
            <button className="btn btn-primary" style={{ marginTop:16 }} onClick={()=>addToast('Notification settings saved!','success')}>Save Preferences</button>
          </div>
        )}

        {section==='pos' && (
          <div className="card">
            <SectionHeader title="POS & Printing" sub="Configure point-of-sale and receipt printing"/>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid var(--border)' }}>
              <div><div style={{ fontWeight:600, fontSize:13 }}>Auto-Print Receipts</div><div style={{ fontSize:11, color:'var(--text-m)', marginTop:2 }}>Print automatically on order confirmation</div></div>
              <label className="toggle"><input type="checkbox" checked={autoPrint} onChange={e=>setAutoPrint(e.target.checked)}/><span className="toggle-slider"/></label>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, padding:'16px 0', borderBottom:'1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Printer Model</div>
                <select className="input" value={printerModel} onChange={e=>setPrinterModel(e.target.value)}>
                  {PRINTER_MODELS.map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Receipt Copies</div>
                <select className="input" value={printCopies} onChange={e=>setPrintCopies(e.target.value)}>
                  {['1','2','3'].map(n=><option key={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div style={{ padding:'14px 0' }}>
              <div style={{ fontWeight:600, fontSize:13, marginBottom:10 }}>Connected Printers</div>
              {branches.filter(b=>b.posEnabled).map(b=>(
                <div key={b.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:'var(--elevated)', borderRadius:'var(--r)', marginBottom:6 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ width:7, height:7, borderRadius:'50%', background:'var(--green)' }}/>
                    <span style={{ fontSize:12 }}>{b.name} — {printerModel}</span>
                  </div>
                  <span className="badge badge-green">Online</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" onClick={()=>addToast('POS settings saved!','success')}>Save POS Settings</button>
          </div>
        )}

        {section==='payment' && (
          <div className="card">
            <SectionHeader title="Payment Methods" sub="Configure accepted payment types"/>
            {[
              { k:'cod',      l:'Cash on Delivery',      sub:'Standard COD for delivery orders' },
              { k:'card',     l:'Card / Visa / Mastercard', sub:'POS terminal card payments' },
              { k:'jazzcash', l:'JazzCash',               sub:'Mobile wallet payments' },
              { k:'easypaisa',l:'EasyPaisa',              sub:'Mobile wallet payments' },
              { k:'online',   l:'Online Banking',         sub:'Bank transfer / IBFT' },
              { k:'pos_cash', l:'POS Cash',               sub:'Cash collected at POS terminal' },
            ].map((m,i,arr)=>(
              <div key={m.k} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 0', borderBottom:i<arr.length-1?'1px solid var(--border)':'none' }}>
                <div>
                  <div style={{ fontWeight:600, fontSize:13 }}>{m.l}</div>
                  <div style={{ fontSize:11, color:'var(--text-m)', marginTop:1 }}>{m.sub}</div>
                  <span className={`badge badge-${paymentMethods[m.k]?'green':'gray'}`} style={{ marginTop:4 }}>{paymentMethods[m.k]?'Active':'Inactive'}</span>
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <label className="toggle"><input type="checkbox" checked={paymentMethods[m.k]} onChange={()=>togglePayment(m.k)}/><span className="toggle-slider"/></label>
                  <button className="btn btn-ghost" style={{ fontSize:11 }} onClick={()=>addToast(`Configuring ${m.l}...`,'info')}>Configure</button>
                </div>
              </div>
            ))}
            <button className="btn btn-primary" style={{ marginTop:16 }} onClick={()=>addToast('Payment settings saved!','success')}>Save Payment Settings</button>
          </div>
        )}

        {section==='tax' && (
          <div className="card">
            <SectionHeader title="Tax & Billing" sub="Configure tax rates, currency, and billing"/>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:16 }}>
              <div style={{ flex:'1 1 160px' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Tax Rate (%)</div>
                <input className="input" value={taxRate} onChange={e=>setTaxRate(e.target.value)} type="number" min="0" max="100"/>
              </div>
              <div style={{ flex:'1 1 160px' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Tax Type</div>
                <select className="input" value={taxType} onChange={e=>setTaxType(e.target.value)}>
                  {TAX_TYPES.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ flex:'1 1 160px' }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Currency</div>
                <select className="input" value={currency} onChange={e=>setCurrency(e.target.value)}>
                  {CURRENCIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ background:'var(--elevated)', borderRadius:'var(--r)', padding:'12px 14px', fontSize:12, color:'var(--text-m)', marginBottom:16 }}>
              Tax is currently set to <strong>{taxRate}%</strong> ({taxType}). This applies to all orders across all branches.
            </div>
            <button className="btn btn-primary" onClick={()=>addToast('Tax settings saved!','success')}>Save Tax Settings</button>
          </div>
        )}

        {section==='branding' && (
          <div className="card">
            <SectionHeader title="Branding" sub="Customize your restaurant's identity"/>
            <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:16 }}>
              {[['Brand Name','BurgerBlast Co.'],['Tagline','Best Smash Burgers in Karachi'],['Support Email','support@burgerblast.com'],['Support Phone','+92 300 1234567']].map(([l,v])=>(
                <div key={l} style={{ flex:'1 1 200px' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>{l}</div>
                  <input className="input" defaultValue={v}/>
                </div>
              ))}
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.06em' }}>Dashboard Theme</div>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <button onClick={toggleTheme} className="btn btn-ghost" style={{ gap:8 }}>
                  {theme==='dark' ? 'Dark Mode' : 'Light Mode'} — click to switch
                </button>
                <span style={{ fontSize:11, color:'var(--text-m)' }}>Current: {theme}</span>
              </div>
            </div>
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:8, textTransform:'uppercase', letterSpacing:'.06em' }}>Brand Color</div>
              <div style={{ display:'flex', gap:10 }}>
                {['#e8521a','#22c55e','#3b82f6','#a855f7','#f59e0b','#ef4444'].map(c=>(
                  <div key={c} style={{ width:36, height:36, borderRadius:8, background:c, border:`3px solid ${c==='#e8521a'?'var(--text)':'transparent'}`, cursor:'pointer' }}/>
                ))}
              </div>
            </div>
            <button className="btn btn-primary" onClick={()=>addToast('Branding saved!','success')}>Save Branding</button>
          </div>
        )}

        {section==='security' && (
          <div className="card">
            <SectionHeader title="Security" sub="Manage authentication and access control"/>
            {[
              { l:'Two-Factor Authentication', d:'Require 2FA for all admin logins',        v:twoFA,       s:setTwoFA       },
              { l:'Session Timeout',           d:'Auto-logout after 30 min of inactivity',  v:sessionTO,   s:setSessionTO   },
              { l:'Login Notifications',       d:'Email alert on new device login',         v:loginNotif,  s:setLoginNotif  },
              { l:'IP Whitelist',              d:'Restrict access to known IP addresses',   v:ipWhitelist, s:setIpWhitelist },
            ].map((item,i,arr)=>(
              <div key={item.l} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 0', borderBottom:i<arr.length-1?'1px solid var(--border)':'none' }}>
                <div><div style={{ fontWeight:600, fontSize:13 }}>{item.l}</div><div style={{ fontSize:11, color:'var(--text-m)', marginTop:2 }}>{item.d}</div></div>
                <label className="toggle"><input type="checkbox" checked={item.v} onChange={e=>item.s(e.target.checked)}/><span className="toggle-slider"/></label>
              </div>
            ))}
            <div style={{ marginTop:16, display:'flex', gap:10 }}>
              <button className="btn btn-primary" onClick={()=>addToast('Password reset email sent!','info')}>Change Password</button>
              <button className="btn btn-ghost" onClick={()=>addToast('Security settings saved!','success')}>Save Settings</button>
            </div>
          </div>
        )}

        {section==='api' && (
          <div className="card">
            <SectionHeader title="API & Integrations" sub="Keys, webhooks and connected services"/>
            <div style={{ marginBottom:22 }}>
              <div style={{ fontSize:12, fontWeight:700, marginBottom:10 }}>API Keys</div>
              {[
                { l:'Production Key', k:'rsk_live_9xB4kGhM...m3Kp', date:'Created Jan 15, 2026' },
                { l:'Test Key', k:'rsk_test_4nR2pQjL...kL7m', date:'Created Mar 2, 2026' },
              ].map(k=>(
                <div key={k.l} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background:'var(--elevated)', borderRadius:'var(--r)', marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:600 }}>{k.l}</div>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'var(--text-m)', marginTop:2 }}>{k.k}</div>
                    <div style={{ fontSize:10, color:'var(--text-m)', marginTop:1 }}>{k.date}</div>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button className="btn btn-ghost" style={{ fontSize:11 }} onClick={()=>addToast('Copied!','success')}>Copy</button>
                    <button className="btn btn-danger" style={{ fontSize:11 }} onClick={()=>addToast('Key revoked','warning')}>Revoke</button>
                  </div>
                </div>
              ))}
              <button className="btn btn-primary" style={{ marginTop:8 }} onClick={()=>addToast('New API key generated!','success')}>+ Generate New Key</button>
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, marginBottom:10 }}>Connected Services</div>
              {[
                { name:'Foodpanda', status:true, type:'Delivery' },
                { name:'Careem Food', status:true, type:'Delivery' },
                { name:'FoodPOS Pro', status:true, type:'POS' },
                { name:'QuickBooks', status:false, type:'Accounting' },
                { name:'WhatsApp Business', status:false, type:'Notifications' },
              ].map((s,i,arr)=>(
                <div key={s.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:i<arr.length-1?'1px solid var(--border)':'none' }}>
                  <div>
                    <span style={{ fontWeight:600, fontSize:13 }}>{s.name}</span>
                    <span className="badge badge-gray" style={{ marginLeft:8 }}>{s.type}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span className={`badge badge-${s.status?'green':'gray'}`}>{s.status?'Connected':'Disconnected'}</span>
                    <button className="btn btn-ghost" style={{ fontSize:11 }} onClick={()=>addToast(`${s.status?'Configuring':'Connecting'} ${s.name}...`,'info')}>{s.status?'Configure':'Connect'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {section==='delivery' && (
          <div className="card">
            <SectionHeader title="Delivery Zones" sub="Manage delivery areas, fees, and minimum orders"/>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {deliveryZones.map(z=>(
                <div key={z.id} style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 16px', background:'var(--elevated)', borderRadius:'var(--r)', border:`1px solid ${z.active?'var(--border)':'var(--border-l)'}`, opacity:z.active?1:.6 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, fontSize:13 }}>{z.name}</div>
                    <div style={{ fontSize:11, color:'var(--text-m)', marginTop:2 }}>Min Order: PKR {z.minOrder} · Fee: PKR {z.fee} · Radius: {z.radius}</div>
                  </div>
                  <span className={`badge badge-${z.active?'green':'gray'}`}>{z.active?'Active':'Inactive'}</span>
                  <label className="toggle">
                    <input type="checkbox" checked={z.active} onChange={e=>setDeliveryZones(zones=>zones.map(dz=>dz.id===z.id?{...dz,active:e.target.checked}:dz))}/>
                    <span className="toggle-slider"/>
                  </label>
                  <button className="btn btn-ghost" style={{ fontSize:11 }} onClick={()=>addToast(`Editing ${z.name}...`,'info')}>Edit</button>
                </div>
              ))}
            </div>
            <button className="btn btn-primary" style={{ marginTop:16 }} onClick={()=>addToast('Delivery zones saved!','success')}>Save Zones</button>
          </div>
        )}
      </div>
    </div>
  );
}
