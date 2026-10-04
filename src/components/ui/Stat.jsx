import { useEffect, useRef, useState } from 'react';

function useInView(ref) {
  const [v, setV] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setV(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); io.disconnect(); } }, { threshold: .4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return v;
}

/** Cifra con contador animado (formato es-CL) + regla de acento + etiqueta. */
export function Stat({ value, unit, label, onDark, animate = true, duration = 1200, style }) {
  const ref = useRef(null);
  const seen = useInView(ref);
  const m = String(value).match(/^([^0-9]*)([0-9.,]+)(.*)$/);
  const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const target = m ? parseFloat(m[2].replace(/\./g, '').replace(',', '.')) : null;
  const [n, setN] = useState(animate && target != null ? 0 : target);
  const dec = m && m[2].includes(',') ? m[2].split(',')[1].length : 0;
  const fmt = x => m ? m[1] + (x == null ? m[2] : x.toLocaleString('es-CL', { minimumFractionDigits: dec, maximumFractionDigits: dec })) + m[3] : value;
  const numRef = useRef(null);
  useEffect(() => { if (reduce && target != null) setN(target); }, []);
  useEffect(() => {
    if (!seen || !animate || reduce || target == null) return;
    let raf, t0;
    const step = t => {
      t0 = t0 || t;
      const p = Math.min(1, (t - t0) / duration);
      // El conteo escribe el texto directamente (sin re-render de React en cada cuadro); al final se fija en el estado.
      if (numRef.current) numRef.current.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step); else setN(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [seen]);
  const shown = fmt(n);
  return <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
    <span className="stat-n" style={{ font: '800 44px/1 var(--font-corporativa)', color: onDark ? '#fff' : 'var(--htp-azul)', letterSpacing: '-.01em', fontVariantNumeric: 'tabular-nums' }}>
      <span className="sr-only">{String(value) + (unit ? ' ' + unit : '')}</span>
      <span ref={numRef} aria-hidden="true">{shown}</span>
      {unit && <span aria-hidden="true" style={{ fontWeight: 300, fontSize: 22, marginLeft: 4, color: onDark ? 'var(--htp-coral)' : 'var(--text-accent)' }}>{unit}</span>}
    </span>
    <span style={{ width: 32, height: 2, background: 'var(--rule-accent)' }} />
    <span style={{ font: '400 14px/1.4 var(--font-complementaria)', color: onDark ? 'var(--htp-azul-100)' : 'var(--text-muted)' }}>{label}</span>
  </div>;
}
