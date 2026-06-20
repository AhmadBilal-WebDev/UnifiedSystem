import React from 'react';
import { useApp } from '../contexts/AppContext';

const ICONS = {
  success: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>,
  error:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  warning: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>,
  info:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
};
const COLORS = {
  success: { bg:'rgba(16,217,126,.12)', border:'rgba(16,217,126,.35)', text:'var(--green)' },
  error:   { bg:'rgba(245,61,92,.12)',  border:'rgba(245,61,92,.35)',  text:'var(--red)'   },
  warning: { bg:'rgba(234,179,8,.12)',  border:'rgba(234,179,8,.35)',  text:'var(--yellow)'},
  info:    { bg:'rgba(59,142,248,.12)', border:'rgba(59,142,248,.35)', text:'var(--blue)'  },
};

export default function Toast() {
  const { toasts, removeToast } = useApp();
  return (
    <div style={{ position:'fixed', bottom:24, right:24, display:'flex', flexDirection:'column', gap:8, zIndex:9000 }}>
      {toasts.map(t => {
        const c = COLORS[t.type] || COLORS.info;
        const ic = ICONS[t.type] || ICONS.info;
        return (
          <div key={t.id} className="fade-in"
            style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 16px', background:c.bg, border:`1px solid ${c.border}`, borderRadius:'var(--rl)', backdropFilter:'blur(12px)', maxWidth:340, boxShadow:'0 8px 24px rgba(0,0,0,.4)' }}>
            <span style={{ color:c.text, flexShrink:0 }}>{ic}</span>
            <span style={{ fontSize:13, fontWeight:600, flex:1, color:'var(--text-s)' }}>{t.message}</span>
            <button onClick={()=>removeToast(t.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-m)', padding:0, lineHeight:1, flexShrink:0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
