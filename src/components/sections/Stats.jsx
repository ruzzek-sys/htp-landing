import { useEffect, useRef } from 'react';
import { Icon, Reveal, SectionTitle, Stat } from '../ui';
import { reduceMotion } from '../../lib/motion.js';

export function Stats({ t }) {
  const s = t.stats;
  const wrapRef = useRef(null), layerRef = useRef(null);
  useEffect(() => {
    const w = wrapRef.current, layer = layerRef.current; if (!w || !layer) return;
    const rand = (a, b) => a + Math.random() * (b - a); const key = v => Math.round(v * 100) / 100;
    // Cruces decorativas en cada intersección de la grilla (se recalculan al cambiar el tamaño).
    const build = () => {
      const cells = [...w.querySelectorAll('.stat-cell')]; const st = w.querySelector('.stats'); const W = st.offsetWidth; const xs = new Set([0, key(W - 1)]), ys = new Set([0]); const L = w.getBoundingClientRect();
      cells.forEach(c => { const r = c.getBoundingClientRect(); const m = new DOMMatrixReadOnly(getComputedStyle(c).transform); xs.add(key(r.right - m.m41 - 1 - L.left)); ys.add(key(r.bottom - m.m42 - 1 - L.top)); });
      const xa = [...xs].sort((a, b) => a - b).filter((x, i, a) => !i || x - a[i - 1] > 4);
      let h = ''; ys.forEach(y => xa.forEach(x => { const d = rand(6, 10); h += '<div class="st-cross" style="left:' + x + 'px;top:' + y + 'px;--dur:' + d.toFixed(2) + 's;--delay:' + (-rand(0, d)).toFixed(2) + 's;--in:' + rand(0, 350).toFixed(0) + 'ms"><i class="v"></i><i class="h"></i></div>'; })); layer.innerHTML = h;
    };
    build(); const ro = new ResizeObserver(build); ro.observe(w);
    let tm = 0; const on = () => { clearTimeout(tm); layer.classList.add('on'); }; const last = [...w.querySelectorAll('.stat-cell')].pop();
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); if (reduceMotion()) return on(); if (last) last.addEventListener('transitionend', ev => { if (ev.target === last && ev.propertyName === 'opacity') on(); }, { once: false }); tm = setTimeout(on, 1600); } }, { threshold: .1 }); io.observe(w);
    // Borde luminoso que sigue al puntero.
    let raf = 0, px = 0, py = 0; const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
    const upd = () => { raf = 0; w.querySelectorAll('.stat-cell').forEach(c => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (px - r.left) + 'px'); c.style.setProperty('--my', (py - r.top) + 'px'); }); };
    const mv = e => { px = e.clientX; py = e.clientY; if (!raf) raf = requestAnimationFrame(upd); };
    const en = () => w.classList.add('is-hovering'), lv = () => w.classList.remove('is-hovering');
    if (fine) { w.addEventListener('pointermove', mv); w.addEventListener('pointerenter', en); w.addEventListener('pointerleave', lv); }
    return () => { clearTimeout(tm); io.disconnect(); ro.disconnect(); cancelAnimationFrame(raf); w.removeEventListener('pointermove', mv); w.removeEventListener('pointerenter', en); w.removeEventListener('pointerleave', lv); };
  }, []);
  return <section id="cifras" aria-labelledby="cifras-t" className="sec">
    <div className="wrap">
      <Reveal className="sec-head">
        <h2 id="cifras-t"><SectionTitle light={s.light} bold={s.bold} size="lg" /></h2>
        <p className="lead">{s.lead}</p>
      </Reveal>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false"><defs><linearGradient id="htpIcGrad" gradientUnits="userSpaceOnUse" x1="2" y1="0" x2="22" y2="0"><stop offset="0" stopColor="#003794"></stop><stop offset=".18" stopColor="#003794"></stop><stop offset=".62" stopColor="#8A6A87"></stop><stop offset="1" stopColor="#F49368"></stop></linearGradient></defs></svg>
      <div ref={wrapRef} className="stats-wrap">
        <Reveal stagger={160} className="stats">
          {s.items.map(it => <div key={it.l} className="stat-cell glow-light" tabIndex={0}>
            <span className="frosted-button-stroke" aria-hidden="true"></span>
            <span className="stat-ic"><Icon name={it.ic} size={26} strokeWidth={1.5} color="currentColor" /></span>
            <Stat value={it.v} unit={it.u} label={it.l} />
            <p className="stat-d">{it.d}</p>
          </div>)}
        </Reveal>
        <div ref={layerRef} className="st-crosses" aria-hidden="true"></div>
      </div>
    </div>
  </section>;
}
