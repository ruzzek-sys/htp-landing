import { useEffect, useRef, useState } from 'react';
import { Button, Icon, Reveal, SectionTitle } from '../ui';
import { useReplay } from '../../lib/hooks.js';
import { goTo, pad2, reduceMotion } from '../../lib/motion.js';
import { requestService } from '../../lib/serviceRequest.js';

/**
 * Líneas de negocio. En escritorio (si cabe en alto) la sección queda fija ("pin") y el scroll avanza
 * entre servicios; en móvil o pantallas bajas rota sola cada 8 s.
 */
export function Lines({ t }) {
  const L = t.lines; const n = L.items.length;
  const secRef = useRef(null); const bars = useRef([]); const tabs = useRef([]);
  const [i, setI] = useState(0); const iRef = useRef(0);
  const inRef = useRef(null); const seen = useReplay(inRef, { threshold: .2 });
  const frameRef = useRef(null); const pinRef = useRef(false);
  // Se fija si cabe: en escritorio, la lista completa; en móvil/tablet (≤900), la lista más una imagen de al menos 120px.
  const pinTop = () => { const pin = secRef.current && secRef.current.querySelector('.ln-pin'); return pin ? parseFloat(getComputedStyle(pin).top) || 72 : 72; };
  const measure = () => { const fr = frameRef.current; if (!fr) return false; const list = fr.querySelector('.ln-list').offsetHeight; return window.innerWidth < 901 ? window.innerHeight - pinTop() >= list + 120 + 44 : window.innerHeight >= list + 120; };
  // Recorrido de scroll durante el que la sección queda fija.
  const travel = () => { const el = secRef.current; return el.offsetHeight - el.querySelector('.ln-pin').offsetHeight; };
  const isDesk = () => pinRef.current;
  const [desk, setDesk] = useState(false);
  const act = k => { if (k !== iRef.current) { iRef.current = k; setI(k); } };
  useEffect(() => {
    const onScroll = () => { if (!isDesk()) return; const el = secRef.current; if (!el) return; const r = { top: el.getBoundingClientRect().top - pinTop() }; const total = travel(); const p = Math.min(Math.max(-r.top / total, 0), .9999); const f = p * n; const k = Math.floor(f); bars.current.forEach((b, j) => b && b.style.setProperty('--p', j < k ? 1 : j === k ? f - k : 0)); act(k); };
    const onResize = () => { const p = measure(); pinRef.current = p; setDesk(p); if (p) onScroll(); };
    window.addEventListener('scroll', onScroll, { passive: true }); window.addEventListener('resize', onResize); onResize();
    document.fonts && document.fonts.ready.then(onResize);
    const ro = new ResizeObserver(onResize); frameRef.current && ro.observe(frameRef.current.querySelector('.ln-list'));
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); ro.disconnect(); };
  }, []);
  // Sin pin (móvil/tablet): rota sola solo mientras la sección está a la vista y hasta que el usuario elige un servicio.
  const [vis, setVis] = useState(false); const [hold, setHold] = useState(false);
  useEffect(() => { const el = secRef.current; if (!el) return; const io = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { threshold: .25 }); io.observe(el); return () => io.disconnect(); }, []);
  useEffect(() => {
    if (desk) return; if (hold) { bars.current.forEach((b, j) => b && b.style.setProperty('--p', j === iRef.current ? 1 : 0)); return; } if (!vis) return;
    let raf, t0 = performance.now(); const DUR = reduceMotion() ? 1e9 : 8000;
    const tick = now => { const p = Math.min((now - t0) / DUR, 1); bars.current.forEach((b, j) => b && b.style.setProperty('--p', j === iRef.current ? p : 0)); if (p >= 1) { act((iRef.current + 1) % n); t0 = now; } raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [desk, i, vis, hold]);
  const pick = k => { if (!isDesk()) { setHold(true); act(k); return; } const el = secRef.current; const total = travel(); const top = el.getBoundingClientRect().top + window.scrollY - pinTop() + total * (k + .04) / n; window.scrollTo({ top, behavior: reduceMotion() ? 'auto' : 'smooth' }); };
  const sw = useRef(null);
  const swipe = { onTouchStart: e => { sw.current = [e.touches[0].clientX, e.touches[0].clientY]; }, onTouchEnd: e => { const s0 = sw.current; sw.current = null; if (!s0) return; const dx = e.changedTouches[0].clientX - s0[0], dy = e.changedTouches[0].clientY - s0[1]; if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return; pick((iRef.current + (dx < 0 ? 1 : -1) + n) % n); } };
  const onKey = (e, k) => { let m = 0; if (e.key === 'ArrowDown' || e.key === 'ArrowRight') m = 1; if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') m = -1; if (!m) return; e.preventDefault(); const nk = Math.min(Math.max(k + m, 0), n - 1); pick(nk); tabs.current[nk] && tabs.current[nk].focus(); };
  return <section id="negocios" aria-labelledby="negocios-t" className="sec-soft ln-sec">
    <div className="wrap ln-top">
      <Reveal className="sec-head ln-head">
        <h2 id="negocios-t"><SectionTitle light={L.light} bold={L.bold} size="lg" /></h2>
        <p className="lead">{L.lead}</p>
      </Reveal>
    </div>
    <div ref={secRef} className={'ln-scroll' + (desk ? '' : ' no-pin')} style={{ '--steps': n }}>
      <div className="ln-pin">
        <div ref={frameRef} className="wrap ln-frame">
          <div ref={inRef} className={'lines' + (seen ? ' ln-seen' : '')}>
            <div className="ln-list">
              <div role="tablist" aria-label={L.bold} className="ln-nav">
                {L.items.map((x, k) => <button key={x.k} ref={el => { tabs.current[k] = el; }} id={'ln-tab-' + k} role="tab" aria-selected={k === i} aria-controls={'ln-body-' + k} aria-label={x.k} tabIndex={k === i ? 0 : -1} className={'ln-seg' + (k === i ? ' on' : '') + (k < i ? ' done' : '')} onClick={() => pick(k)} onKeyDown={e => onKey(e, k)}>
                  <span className="ln-seg-n">{pad2(k + 1)}</span>
                  <span className="ln-seg-track"><span className="ln-bar" style={{ backgroundPosition: (k / (L.items.length - 1) * 100) + '% 0', backgroundSize: (L.items.length * 100) + '% 100%' }} ref={el => { bars.current[k] = el; }}></span></span>
                </button>)}
              </div>
              <div className="ln-panels">
                {L.items.map((x, k) => <div key={x.k} id={'ln-body-' + k} role="tabpanel" aria-labelledby={'ln-tab-' + k} aria-hidden={k !== i} className={'ln-panel' + (k === i ? ' on' : k < i ? ' past' : ' next')}>
                  <p className="ln-kicker"><span className="ln-num">{pad2(k + 1)}</span></p>
                  <h3 className="ln-name">{x.k}</h3>
                  <p className="ln-t">{x.t}</p>
                  <ul className="ln-bul">{x.b.map(b => <li key={b}><Icon name="check" size={16} color="var(--text-accent)" /><span>{b}</span></li>)}</ul>
                  <Button variant="link" iconRight="arrow-right" onClick={() => { requestService(k); goTo('contacto'); }} tabIndex={k === i ? 0 : -1}>{L.more}</Button>
                </div>)}
              </div>
            </div>
            <div className="ln-stage" aria-live="polite" {...swipe}>
              {L.items.map((x, k) => <img key={k} src={x.img} alt={k === i ? x.alt : ''} aria-hidden={k !== i} className={'ln-img' + (k === i ? ' on' : '')} style={x.pos ? { objectPosition: x.pos } : undefined} loading="lazy" />)}
              <div className="ln-shade" aria-hidden="true"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>;
}
