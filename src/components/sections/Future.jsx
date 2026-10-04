import { Fragment, useEffect, useRef, useState } from 'react';
import { SectionTitle } from '../ui';
import { useReplay } from '../../lib/hooks.js';
import { pad2, reduceMotion } from '../../lib/motion.js';

/**
 * Visión 2050: galería fija a pantalla completa; cada 100vh de scroll revela la siguiente imagen
 * con un clip-path de abajo hacia arriba y un leve parallax.
 */
export function Future({ t }) {
  const F = t.future; const S = F.slides; const n = S.length, steps = n - 1;
  const secRef = useRef(null); const items = useRef([]); const bgs = useRef([]); const barRef = useRef(null);
  const [act, setAct] = useState(0); const [shown, setShown] = useState(0); const [out, setOut] = useState(false);
  useEffect(() => {
    const el = secRef.current; if (!el) return; let raf = 0; const rm = reduceMotion();
    const upd = () => {
      raf = 0; const r = el.getBoundingClientRect();
      // La galería queda fija bajo el header: el avance se mide desde que su borde superior toca el header hasta que se suelta.
      const st = el.querySelector('.fp-stage'); const top = parseFloat(getComputedStyle(st).top) || 0; const travel = Math.max(1, el.offsetHeight - st.offsetHeight);
      const p = Math.min(steps, Math.max(0, (top - r.top) / travel * steps));
      for (let k = 1; k < n; k++) { const l = Math.min(1, Math.max(0, p - (k - 1))); const it = items.current[k]; if (it) it.style.clipPath = 'inset(' + ((1 - l) * 100).toFixed(2) + '% 0 0 0)'; const b = bgs.current[k]; if (b && !rm) b.style.transform = 'translate3d(0,' + (4 - 4 * l) + '%,0)'; const pb = bgs.current[k - 1]; if (pb && !rm) pb.style.transform = 'translate3d(0,' + (-4 * l) + '%,0)'; }
      if (barRef.current) barRef.current.style.transform = 'scaleX(' + (p / steps).toFixed(4) + ')'; setAct(Math.min(steps, Math.round(p)));
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(upd); }; upd(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [n]);
  // Cambio de texto con salida/entrada breve.
  useEffect(() => { if (act === shown) return; setOut(true); const id = setTimeout(() => { setShown(act); setOut(false); }, 220); return () => clearTimeout(id); }, [act]);
  const headRef = useRef(null); const headIn = useReplay(headRef, { rootMargin: '0px 0px -30% 0px' });
  const futRef = useRef(null);
  // El fondo del contenedor .rf-wrap pasa de azul profundo a blanco al entrar en esta sección (--fp).
  useEffect(() => {
    const el = futRef.current; if (!el) return; const w = el.parentElement; if (!w || !w.classList.contains('rf-wrap')) return; let raf = 0;
    const upd = () => { raf = 0; const r = el.getBoundingClientRect(), vh = window.innerHeight; const p = Math.min(1, Math.max(0, (vh * .7 - r.top) / (vh * .5))); w.style.setProperty('--fp', p.toFixed(3)); };
    const on = () => { if (!raf) raf = requestAnimationFrame(upd); }; upd(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);
  const d = S[shown];
  return <section ref={futRef} id="futuro" aria-labelledby="fut-t" className="fut">
    <div className="wrap fut-intro"><div ref={headRef} className={'fut-head' + (headIn ? ' in' : '')}><h2 id="fut-t"><SectionTitle light={F.light} bold={F.bold} size="lg" align="center" /></h2><p className="lead">{F.t}</p></div></div>
    <div ref={secRef} className="fp" style={{ height: (n * 100) + 'vh' }}>
      <div className="fp-stage">
        {S.map((x, k) => <div key={k} ref={e => { items.current[k] = e; }} className="fp-item" style={{ zIndex: k + 1, clipPath: k ? 'inset(100% 0 0 0)' : 'inset(0 0 0 0)' }} aria-hidden={k !== shown}><div ref={e => { bgs.current[k] = e; }} className="fp-bg" style={{ transform: k ? 'translate3d(0,4%,0)' : 'none' }}><img src={x.img} alt="" loading="lazy" /></div></div>)}
        <div className="fp-shade" aria-hidden="true"></div>
        <div className="fp-ui wrap" aria-live="polite">
          <div className="fp-top">
            <span className="fp-progress" aria-hidden="true"><span ref={barRef}></span></span>
            <div className="fp-steps"><span className="fp-pill"><span key={act} className="fp-num">{pad2(act + 1)}</span></span><span aria-hidden="true">/</span><span className="fp-pill">{pad2(n)}</span></div>
            <h3 className={'fp-name fp-swap' + (out ? ' is-out' : '')}>{d.n}</h3>
            <div className={'fp-specs fp-swap' + (out ? ' is-out' : '')}>{d.sp.map((x, k) => <Fragment key={k}>{k > 0 && <span className="fp-dot" aria-hidden="true"></span>}<span>{x}</span></Fragment>)}</div>
          </div>
          <p className={'fp-quote fp-swap' + (out ? ' is-out' : '')}>{d.q}<small>{d.a}</small></p>
        </div>
      </div>
    </div>
  </section>;
}
