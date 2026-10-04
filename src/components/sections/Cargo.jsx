import { useEffect, useRef, useState } from 'react';
import { Card, Icon, Reveal, SectionTitle } from '../ui';
import { reduceMotion } from '../../lib/motion.js';

export function Cargo({ t }) {
  const C = t.cargo; const [i, setI] = useState(0); const it = C.items[i]; const n = C.items.length;
  const gridRef = useRef(null); const turns = useRef(0); const first = useRef(true);
  // Al cambiar de pestaña, el brillo del tile activo da una vuelta completa (omitido en el primer render).
  useEffect(() => { const el = gridRef.current; if (!el || reduceMotion()) return; if (first.current) { first.current = false; return; } turns.current += 1; el.style.setProperty('--burst-angle', (turns.current * 360) + 'deg'); el.classList.add('pulse'); const id = setTimeout(() => el.classList.remove('pulse'), 1600); return () => clearTimeout(id); }, [i]);
  // En tablet/móvil el detalle queda bajo las fichas: si al tocar una no se ve completo, se desplaza para mostrarlo.
  const pick = k => {
    setI(k); if (window.innerWidth > 960) return;
    requestAnimationFrame(() => { const p = document.getElementById('cg-panel'); if (!p) return; const r = p.getBoundingClientRect(), vh = window.innerHeight; if (r.bottom <= vh - 8) return; const hh = document.querySelector('header')?.offsetHeight || 64; window.scrollBy({ top: Math.min(r.bottom - vh + 16, r.top - hh - 16), behavior: reduceMotion() ? 'auto' : 'smooth' }); });
  };
  const onKey = e => { const m = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key]; if (!m) return; e.preventDefault(); const k = (i + m + n) % n; setI(k); document.getElementById('cg-tab-' + k).focus(); };
  return <section id="carga" aria-labelledby="carga-t" className="sec">
    <div className="wrap">
      <Reveal className="sec-head">
        <h2 id="carga-t"><SectionTitle light={C.light} bold={C.bold} size="lg" /></h2>
        <p className="lead">{C.lead}</p>
      </Reveal>
      <Reveal className="cargo">
        <div className="cg-left">
          <p className="hint cg-hint">{C.hint}</p>
          <svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}><defs><linearGradient id="cg-ic-grad" gradientUnits="userSpaceOnUse" x1="2" y1="2" x2="22" y2="22"><stop offset="0" style={{ stopColor: 'var(--htp-azul)' }} /><stop offset="1" style={{ stopColor: 'var(--htp-naranja)' }} /></linearGradient><linearGradient id="cg-edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff" stopOpacity=".75" /><stop offset=".35" stopColor="#fff" stopOpacity=".12" /><stop offset=".7" stopColor="#fff" stopOpacity=".08" /><stop offset="1" stopColor="#F49368" stopOpacity=".55" /></linearGradient></defs></svg><div role="tablist" aria-label={C.bold} ref={gridRef} className="cg-grid" onKeyDown={onKey}>
            {C.items.map((x, k) => <button key={x.k} id={'cg-tab-' + k} role="tab" aria-selected={k === i} aria-controls="cg-panel" tabIndex={k === i ? 0 : -1} className={'cg-tile' + (k === i ? ' on' : '')} onClick={() => pick(k)}>
              {k === i && <span className="frosted-button-stroke" aria-hidden="true"></span>}<Icon name={x.ic} size={30} strokeWidth={1.4} color="currentColor" /><span>{x.k}</span>
            </button>)}
          </div>
        </div>
        <div id="cg-panel" role="tabpanel" aria-labelledby={'cg-tab-' + i} className="cg-panel-wrap">
          <Card variant="glass" cut="right" style={{ height: '100%' }}>
            <div key={i} className="fade-up cg-panel">
              <span className="cg-big" aria-hidden="true"><Icon name={it.ic} size={72} strokeWidth={1.2} color="var(--htp-coral)" /></span>
              <h3 className="cg-h3">{it.k}</h3>
              <ul className="cg-ex">{it.ex.map(e => <li key={e}>{e}</li>)}</ul>
              <p className="cg-t">{it.t}</p>
              <p className="cg-f"><Icon name="badge-check" size={18} color="currentColor" />{it.f}</p>
            </div>
          </Card>
        </div>
      </Reveal>
    </div>
  </section>;
}
