import { useEffect, useId, useRef } from 'react';
import { IconButton } from './IconButton.jsx';

/** Diálogo modal con trampa de foco y cierre con Escape. */
export function Dialog({ open, title, children, actions, onClose, width = 520, inline, style }) {
  const ref = useRef(null);
  const tid = useId(); // estable entre el HTML pregenerado y el navegador
  useEffect(() => {
    if (!open || inline) return;
    const prev = document.activeElement;
    const el = ref.current;
    const f = () => el && el.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    const first = f();
    first && first[0] && first[0].focus();
    const k = e => {
      if (e.key === 'Escape' && onClose) onClose();
      if (e.key === 'Tab') {
        const l = f(); if (!l || !l.length) return;
        const a = l[0], z = l[l.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener('keydown', k);
    return () => { document.removeEventListener('keydown', k); prev && prev.focus && prev.focus(); };
  }, [open, inline]);
  if (!open) return null;
  const box = <div ref={ref} role="dialog" aria-modal={inline ? undefined : true} aria-labelledby={tid}
    style={{ width, maxWidth: '100%', background: '#fff', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', ...style }}>
    <div style={{ height: 6, background: 'var(--htp-degradado)' }} />
    <div style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <h2 id={tid} style={{ margin: 0, font: '700 22px/1.2 var(--font-complementaria)', color: 'var(--htp-azul)' }}>{title}</h2>
        {onClose && <IconButton icon="x" label="Cerrar" variant="ghost" size={34} onClick={onClose} />}
      </div>
      <div style={{ font: '400 15px/1.55 var(--font-complementaria)', color: 'var(--text-muted)' }}>{children}</div>
      {actions && <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>{actions}</div>}
    </div>
  </div>;
  if (inline) return box;
  return <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(10,26,63,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 'var(--z-dialog)' }}>
    <div onClick={e => e.stopPropagation()}>{box}</div>
  </div>;
}
