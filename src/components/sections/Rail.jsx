import { Fragment, useEffect, useRef, useState } from 'react';
import { Icon, Reveal, SectionTitle } from '../ui';
import { RailMap } from '../RailMap.jsx';
import { reduceMotion } from '../../lib/motion.js';
import rail1 from '../../assets/images/rail-1.webp';
import rail2 from '../../assets/images/rail-2.webp';
import rail3 from '../../assets/images/rail-3.webp';
import rail4 from '../../assets/images/rail-4.webp';

const RL_N = 40, RL_EASE = 'cubic-bezier(0.45,0,0.55,1)';
const RL_IMGS = [rail1, rail2, rail3, rail4];

/**
 * Fila de la lista de conectividad: al hover/focus, 40 barras naranjas barren la fila en cascada.
 * En táctil (≤900px) funciona como acordeón: el tap abre/cierra la fila y despliega su imagen bajo el título.
 */
function RailRow({ r, k, img, act, setAct }) {
  const ref = useRef(null); const anims = useRef([]);
  const sweep = (to, origin) => {
    const el = ref.current; if (!el) return; const rects = [...el.querySelectorAll('.rl-bar')]; const rm = reduceMotion();
    const from = rects.map(b => new DOMMatrix(getComputedStyle(b).transform).a); anims.current.forEach(a => a.cancel());
    anims.current = rects.map((b, i) => { b.style.transformOrigin = origin; b.style.transform = 'scaleX(' + to + ')'; return rm ? { cancel() {} } : b.animate([{ transform: 'scaleX(' + from[i] + ')' }, { transform: 'scaleX(' + to + ')' }], { duration: 300, delay: i * 9, easing: RL_EASE, fill: 'backwards' }); });
  };
  const hide = () => { if (!ref.current.classList.contains('hot')) return; ref.current.classList.remove('hot'); sweep(0, '100% 50%'); };
  const on = () => { if (ref.current.classList.contains('hot')) return; ref.current.classList.add('hot'); sweep(1.05, '0% 50%'); setAct(k); }, off = () => { hide(); setAct(a => a === k ? -1 : a); };
  // Si se abre otra fila (p. ej. con un tap), esta se cierra.
  useEffect(() => { if (act !== k) hide(); }, [act]);
  const ptr = useRef(null);
  const isOpen = act === k;
  return <li ref={ref} className="rl-item" tabIndex={0} aria-expanded={isOpen}
    onPointerDown={e => { ptr.current = e.pointerType; }}
    onPointerEnter={e => { if (e.pointerType === 'mouse') on(); }} onPointerLeave={e => { if (e.pointerType === 'mouse') off(); }}
    onFocus={() => { if (!ptr.current) on(); }} onBlur={() => { ptr.current = null; off(); }}
    onClick={() => { const t = ptr.current; ptr.current = null; if (t && t !== 'mouse') ref.current.classList.contains('hot') ? off() : on(); }}
    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ref.current.classList.contains('hot') ? off() : on(); } }}>
    <div className="rl-pat" aria-hidden="true">{Array.from({ length: RL_N }, (_, i) => <span key={i} className="rl-bar"></span>)}</div>
    <span className="rl-idx">{String(k + 1).padStart(2, '0')}</span>
    <span className="rl-title">{r[1]}</span>
    <span className="rl-fig">[{r[2]}]</span>
    <span className="rl-chev" aria-hidden="true"><Icon name="chevron-down" size={20} color="currentColor" /></span>
    <span className="rl-thumb"><span><img src={img} alt="" loading="lazy" /></span></span>
  </li>;
}

export function Rail({ t, lang }) {
  const R = t.rail; const [act, setAct] = useState(-1);
  return <section id="conectividad" aria-labelledby="rail-t" className="sec sec-deep rail-sec" data-on-dark="">
    <div className="wrap rail">
      <div className="rl">
        <Reveal className="rl-head">
          <h2 id="rail-t"><SectionTitle light={R.light} bold={R.bold} size="lg" onDark /></h2>
          <p className="rl-lead">{R.leadParts.map(([x, d], i) => d ? <span key={i}>{x}</span> : <Fragment key={i}>{x}</Fragment>)}</p>
        </Reveal>
        <div className={'rl-body' + (act >= 0 ? ' has-act' : '')}>
          <Reveal as="ul" stagger={120} className="rl-list">{R.rows.map((r, k) => <RailRow key={r[1]} r={r} k={k} img={RL_IMGS[k]} act={act} setAct={setAct} />)}</Reveal>
          <div className="rl-stage" aria-hidden="true">{R.rows.map((r, k) => <img key={k} src={RL_IMGS[k]} alt="" loading="lazy" className={'rl-img' + (k === act ? ' on' : '')} />)}</div>
        </div>
      </div>
      <Reveal delay={240} className="rail-map">
        <RailMap lang={lang} />
      </Reveal>
    </div>
  </section>;
}
