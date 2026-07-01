import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { fmt, SectionHeader } from '../components/ui';

export default function Reports() {
  const { orderList, getClientBranches, addToast } = useApp();
  const branches = getClientBranches();
  const [reportType, setReportType] = useState('daily');
  const [branchFilter, setBranchFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState(() => { const d=new Date(); d.setDate(d.getDate()-30); return d.toISOString().split('T')[0]; });
  const [dateTo,   setDateTo  ] = useState(() => new Date().toISOString().split('T')[0]);

  const filteredOrders = orderList.filter(o => {
    if (branchFilter !== 'all' && o.branchId !== branchFilter) return false;
    const d = new Date(o.createdAt);
    return d >= new Date(dateFrom) && d <= new Date(dateTo + 'T23:59:59');
  });

  const totalRevenue = filteredOrders.reduce((s,o)=>s+o.total,0);
  const avgOrder     = filteredOrders.length ? Math.round(totalRevenue/filteredOrders.length) : 0;
  const posRevenue   = filteredOrders.filter(o=>o.source==='pos').reduce((s,o)=>s+o.total,0);
  const codRevenue   = filteredOrders.filter(o=>o.paymentMethod==='cod').reduce((s,o)=>s+o.total,0);
  const cancelled    = filteredOrders.filter(o=>o.status==='cancelled').length;
  const delivered    = filteredOrders.filter(o=>o.status==='delivered').length;

  const exportCSV = () => {
    if (filteredOrders.length === 0) return;
    const headers = ['Branch','Customer','Status','Source','Payment','Total','Created At'];
    const rows = filteredOrders.map(o => {
      const branchName = branches.find(b => b.id === o.branchId || b._id === o.branchId)?.name || '';
      return [
        branchName, o.customerName || '', o.status, o.source,
        o.paymentMethod, o.total, new Date(o.createdAt).toLocaleString(),
      ];
    });
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g,'""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${reportType}-${dateFrom}-to-${dateTo}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('CSV downloaded!', 'success');
  };

  const REPORT_TYPES = [
    { id:'daily',      label:'Daily Summary',          desc:'Daily orders, revenue, and performance' },
    { id:'weekly',     label:'Weekly Performance',     desc:'Week-over-week trends and KPIs' },
    { id:'monthly',    label:'Monthly Statement',      desc:'Full monthly P&L and analytics' },
    { id:'pos',        label:'POS Revenue Report',     desc:'Breakdown of all POS transactions' },
    { id:'staff',      label:'Staff Performance',      desc:'Staff login hours and order handling' },
    { id:'inventory',  label:'Inventory Usage',        desc:'Consumed stock vs reorders' },
    { id:'cancelations',label:'Cancellation Report',  desc:'Rejected and cancelled order analysis' },
    { id:'cod',        label:'COD Collection Report',  desc:'Cash on delivery orders and collections' },
    { id:'tax',        label:'Tax Summary',            desc:'GST and tax collected per branch' },
    { id:'custom',     label:'Custom Date Range',      desc:'Build a custom report for any period' },
  ];

  return (
    <div className="page-content">
      <div>
        <h2 style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:800, fontSize:18 }}>Reports</h2>
        <p style={{ fontSize:12, color:'var(--text-m)', marginTop:2 }}>Generate and export detailed reports</p>
      </div>

      <div className="grid-report">
        {/* Report Types */}
        <div className="card" style={{ alignSelf:'start' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--text-m)', marginBottom:12, textTransform:'uppercase', letterSpacing:'.06em' }}>Report Type</div>
          {REPORT_TYPES.map(r=>(
            <button key={r.id} onClick={()=>setReportType(r.id)}
              style={{ width:'100%', padding:'10px 12px', borderRadius:'var(--r)', marginBottom:4, cursor:'pointer', background:reportType===r.id?'var(--accent-soft)':'none', border:`1px solid ${reportType===r.id?'rgba(232,82,26,.35)':'transparent'}`, transition:'.15s', textAlign:'left' }}>
              <div style={{ fontWeight:600, fontSize:12, color:reportType===r.id?'var(--accent)':'var(--text-s)' }}>{r.label}</div>
              <div style={{ fontSize:10, color:'var(--text-m)', marginTop:1 }}>{r.desc}</div>
            </button>
          ))}
        </div>

        {/* Report Builder */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div className="card">
            <SectionHeader title="Configure Report" sub={REPORT_TYPES.find(r=>r.id===reportType)?.desc}/>
            <div className="grid-form-2" style={{ gap:14 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Branch</div>
                <select className="input" value={branchFilter} onChange={e=>setBranchFilter(e.target.value)}>
                  <option value="all">All Branches</option>
                  {branches.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Date From</div>
                <input className="input" type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Date To</div>
                <input className="input" type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}/>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--text-m)', marginBottom:5, textTransform:'uppercase', letterSpacing:'.06em' }}>Export</div>
                <div style={{ fontSize:11, color:'var(--text-m)', paddingTop:8 }}>CSV file, built from the data below</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:18 }}>
              <button className="btn btn-primary" style={{ flex:1, justifyContent:'center' }} onClick={exportCSV} disabled={filteredOrders.length === 0}>
                Export as CSV ({filteredOrders.length} orders)
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="card" style={{ padding:0, overflow:'hidden' }}>
            <div style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', background:'var(--elevated)' }}>
              <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:14 }}>
                {REPORT_TYPES.find(r=>r.id===reportType)?.label} — Preview
              </div>
              <div style={{ fontSize:11, color:'var(--text-m)', marginTop:2 }}>
                {new Date(dateFrom).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})} – {new Date(dateTo).toLocaleDateString('en',{month:'short',day:'numeric',year:'numeric'})} · {filteredOrders.length} orders
              </div>
            </div>
            <div style={{ padding:18 }}>
              <div className="grid-3" style={{ marginBottom:18 }}>
                {[
                  { l:'Total Revenue',  v:fmt(totalRevenue),    c:'var(--accent)' },
                  { l:'Total Orders',   v:filteredOrders.length,c:'var(--blue)'   },
                  { l:'Avg Order Value',v:fmt(avgOrder),        c:'var(--green)'  },
                  { l:'POS Revenue',    v:fmt(posRevenue),      c:'var(--purple)' },
                  { l:'COD Revenue',    v:fmt(codRevenue),      c:'var(--yellow)' },
                  { l:'Delivered',      v:delivered,            c:'var(--green)'  },
                  { l:'Cancelled',      v:cancelled,            c:'var(--red)'    },
                  { l:'Completion Rate',v:`${filteredOrders.length?Math.round(delivered/filteredOrders.length*100):0}%`, c:'var(--cyan)' },
                  { l:'Cancellation %', v:`${filteredOrders.length?Math.round(cancelled/filteredOrders.length*100):0}%`, c:'var(--text-m)' },
                ].map(m=>(
                  <div key={m.l} style={{ background:'var(--elevated)', borderRadius:'var(--r)', padding:'12px 14px' }}>
                    <div style={{ fontSize:9, color:'var(--text-m)', textTransform:'uppercase', letterSpacing:'.05em', fontWeight:700 }}>{m.l}</div>
                    <div style={{ fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:900, fontSize:18, color:m.c, marginTop:4 }}>{m.v}</div>
                  </div>
                ))}
              </div>

              {/* Branch breakdown table */}
              <div style={{ borderRadius:'var(--r)', overflow:'hidden', border:'1px solid var(--border)' }}>
                <table className="table" style={{ margin:0 }}>
                  <thead><tr><th>Branch</th><th>Orders</th><th>Revenue</th><th>POS Rev</th><th>Cancelled</th><th>Avg Value</th></tr></thead>
                  <tbody>
                    {branches.map(b=>{
                      const bo = filteredOrders.filter(o=>o.branchId===b.id);
                      const br = bo.reduce((s,o)=>s+o.total,0);
                      const bp = bo.filter(o=>o.source==='pos').reduce((s,o)=>s+o.total,0);
                      const bc = bo.filter(o=>o.status==='cancelled').length;
                      return (
                        <tr key={b.id}>
                          <td style={{ fontWeight:700 }}>{b.name}</td>
                          <td>{bo.length}</td>
                          <td style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:700 }}>{fmt(br)}</td>
                          <td style={{ fontFamily:"'JetBrains Mono',monospace" }}>{fmt(bp)}</td>
                          <td style={{ color:bc>0?'var(--red)':'var(--text-m)' }}>{bc}</td>
                          <td style={{ fontFamily:"'JetBrains Mono',monospace" }}>{fmt(bo.length?Math.round(br/bo.length):0)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Saved Reports */}
          <div className="card">
            <SectionHeader title="Saved Reports" sub="Report history"/>
            <div style={{ textAlign:'center', padding:'24px 0', color:'var(--text-m)', fontSize:12 }}>
              Exported CSVs are saved to your downloads folder. Report history isn't stored on the server yet.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
