import { useEffect, useRef, useState } from 'react';
import { MAP_COPY } from '../data/map-copy.js';
import { MAP_GEO } from '../data/map-geo.js';
import { RAIL_PATHS } from '../data/rail-paths.js';
import { reduceMotion } from '../lib/motion.js';
import { Icon } from './ui';
import railMask from '../assets/masks/rail-mask.png';
import roadMask from '../assets/masks/road-mask.png';

// Todas las coordenadas están en el sistema del viewBox.
const MAP_VB = [0, 40, 1020, 1344];
const MAP_PTS = [[567, 522], [614, 538], [735, 294], [738, 472], [688, 636]];
const MAP_ACC = [[736, 166, 'l'], [717, 522, 'r'], [647, 840, 'r'], [650, 955, 'r'], [243, 1228, 'r']];
const MAP_DIST = [[648, 410, -63, 2], [522, 778, -52, 1], [252, 1083, 0, 2], [453, 1163, 0, 3]];
const RAIL_MASK = { href: railMask, x: 212, y: 72, w: 685, h: 1283, m: 'matrix(0.83862 0.00045 0.00118 0.83578 54.85425 104.06885)' };
const ROAD_MASK = { href: roadMask, x: 63, y: 73, w: 743, h: 1251 };
const LC = { ferrea: '#5CC8F0', camino: 'var(--htp-celeste)', gas: '#F5C542', limite: 'var(--htp-coral)' };

const pct = (x, y) => ({ left: ((x - MAP_VB[0]) / MAP_VB[2] * 100) + '%', top: ((y - MAP_VB[1]) / MAP_VB[3] * 100) + '%' });
const P = a => a.map(p => p.join(',')).join(' ');
function splitLines(s, n) { const w = s.split(' '); if (n <= 1) return [s]; const per = Math.ceil(w.length / n); const out = []; for (let i = 0; i < w.length; i += per) out.push(w.slice(i, i + per).join(' ')); return out; }

/** Mapa del terreno con puntos de referencia, accesos y capas (vías férreas, caminos, gasoducto, límite). */
export function RailMap({ lang }) {
  const M = MAP_COPY[lang] || MAP_COPY.es; const D = MAP_GEO;
  const [sel, setSel] = useState(null);
  const layer = sel && sel[0] === 'l' ? sel[1] : null;
  const [act, setAct] = useState('limite');
  const cls = k => 'ml ml-' + k + (act === k ? ' on' : ' off') + (layer === k ? ' sel' : '');
  // Tablet/móvil: tras tocar un elemento del mapa, centra en pantalla el bloque instrucción + mapa + descripción
  // (se mide después del render, porque la descripción cambia de alto).
  const rootRef = useRef(null);
  const focusView = () => {
    if (window.innerWidth > 1100) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const root = rootRef.current; if (!root) return;
      const top = root.querySelector('.mx-hint-m').getBoundingClientRect().top, bot = root.querySelector('.map-info').getBoundingClientRect().bottom;
      const hh = document.querySelector('header')?.offsetHeight || 60, avail = window.innerHeight - hh;
      // Si cabe, se centra; si es más alto que la pantalla, se alinea abajo para que la descripción se vea completa.
      const dy = bot - top <= avail - 32 ? top - hh - (avail - (bot - top)) / 2 : bot - window.innerHeight + 16;
      if (Math.abs(dy) > 8) window.scrollBy({ top: dy, behavior: reduceMotion() ? 'auto' : 'smooth' });
    }));
  };
  const toggleLayer = k => { const off = act === k && k !== 'limite'; setAct(off ? 'limite' : k); setSel(off ? null : ['l', k]); focusView(); };
  let info; if (!sel) info = ['440 ha', M.idle[0], M.idle[1]];
  else if (sel[0] === 'p') info = [M.kind.pt + ' ' + (sel[1] + 1), M.pts[sel[1]][0], M.pts[sel[1]][1]];
  else if (sel[0] === 'a') info = [M.kind.acc, M.acc[sel[1]][0], M.acc[sel[1]][1]];
  else info = [M.kind.layer, M.layers[sel[1]][0], M.layers[sel[1]][1]];
  const panelRef = useRef(null); const turns = useRef(0); const first = useRef(true);
  useEffect(() => {
    const el = panelRef.current; if (!el || reduceMotion()) return; if (first.current) { first.current = false; return; }
    turns.current += 1; el.style.setProperty('--burst-angle', (turns.current * 360) + 'deg'); el.classList.add('pulse'); const id = setTimeout(() => el.classList.remove('pulse'), 1600); return () => clearTimeout(id);
  }, [JSON.stringify(sel)]);
  const toggle = k => { setSel(s => s && s[0] === k[0] && s[1] === k[1] ? null : k); focusView(); };
  const isSel = k => sel && sel[0] === k[0] && sel[1] === k[1];
  // Menú de capas dentro del mapa (tablet/móvil): plegado por defecto para no tapar el mapa; se cierra al tocar fuera.
  const [layOpen, setLayOpen] = useState(false); const layRef = useRef(null);
  useEffect(() => { if (!layOpen) return; const f = e => { if (layRef.current && !layRef.current.contains(e.target)) setLayOpen(false); }; document.addEventListener('pointerdown', f); return () => document.removeEventListener('pointerdown', f); }, [layOpen]);
  const LAY = [['ferrea', LC.ferrea, 'solid'], ['camino', LC.camino, 'thin'], ['gas', LC.gas, 'dash'], ['limite', LC.limite, 'dash']];
  return <div ref={rootRef} id="mapa-terreno" className="mx">
    <p className="mx-hint-m">{M.hint}</p>
    <figure className="mx-map" aria-label={M.title}>
      <svg viewBox={MAP_VB.join(' ')} role="img" aria-label={M.title + '. ' + M.note} className="mx-svg">
        <defs><mask id="railmask" maskUnits="userSpaceOnUse" x={MAP_VB[0]} y={MAP_VB[1]} width={MAP_VB[2]} height={MAP_VB[3]}><image href={RAIL_MASK.href} x={RAIL_MASK.x} y={RAIL_MASK.y} width={RAIL_MASK.w} height={RAIL_MASK.h} transform={RAIL_MASK.m} /></mask><mask id="roadmask" maskUnits="userSpaceOnUse" x={MAP_VB[0]} y={MAP_VB[1]} width={MAP_VB[2]} height={MAP_VB[3]}><image href={ROAD_MASK.href} x={ROAD_MASK.x} y={ROAD_MASK.y} width={ROAD_MASK.w} height={ROAD_MASK.h} transform={RAIL_MASK.m} /></mask><clipPath id="mxclip"><rect x={MAP_VB[0]} y={MAP_VB[1]} width={MAP_VB[2]} height={MAP_VB[3]} /></clipPath></defs>
        <g clipPath="url(#mxclip)">
          <rect x={MAP_VB[0]} y={MAP_VB[1]} width={MAP_VB[2]} height={MAP_VB[3]} fill="rgba(10,26,63,.55)" />
          <path d={'M' + D.sea.map(p => p.join(',')).join(' L') + ' Z'} fill="rgba(62,104,188,.55)" stroke="rgba(177,191,218,.55)" strokeWidth="2" />
          {[[[420, 378], [545, 364], [625, 300]], [[478, 490], [556, 513]]].map((pl, i) => <polyline key={i} points={P(pl)} fill="none" stroke="rgba(255,255,255,.75)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />)}
          {[640, 700].map(y => <path key={y} d={'M120 ' + y + 'q18 -9 36 0t36 0t36 0'} fill="none" stroke="rgba(177,191,218,.4)" strokeWidth="3" />)}
          <text x="100" y="780" className="mx-sea"><tspan x="100">{M.bay[0]}</tspan><tspan x="100" dy="34">{M.bay[1]}</tspan></text>
          <text x="330" y="250" className="mx-sea sm" textAnchor="middle"><tspan x="330">{M.port[0]}</tspan><tspan x="330" dy="26">{M.port[1]}</tspan></text>
          <polygon points={P(D.boundary)} fill="rgba(177,191,218,.14)" />
          <g className={cls('camino')}><rect x={MAP_VB[0]} y={MAP_VB[1]} width={MAP_VB[2]} height={MAP_VB[3]} fill={LC.camino} mask="url(#roadmask)" stroke="none" /></g>
          <g className={cls('ferrea')}>
            <rect x={MAP_VB[0]} y={MAP_VB[1]} width={MAP_VB[2]} height={MAP_VB[3]} fill={LC.ferrea} mask="url(#railmask)" stroke="none" />
            <g mask="url(#railmask)"><g transform={RAIL_MASK.m + ' translate(' + RAIL_MASK.x + ' ' + RAIL_MASK.y + ')'}>{RAIL_PATHS.map((r, i) => <polyline key={i} points={P(r)} fill="none" stroke="#fff" strokeWidth="3.5" strokeDasharray="6 9" className="rail-dash" />)}</g></g>
          </g>
          <g className={cls('gas')}>{['yellow_main', 'yellow_north', 'yellow_east'].map(k => <polyline key={k} points={P(D[k])} stroke={LC.gas} strokeWidth="5" strokeDasharray="14 10" />)}</g>
          <g className={cls('limite')}><polygon points={P(D.boundary)} fill="none" stroke={LC.limite} strokeWidth="5" strokeDasharray="16 10" /></g>
          {MAP_DIST.map(([x, y, r, n], i) => <text key={i} transform={'translate(' + x + ' ' + y + ') rotate(' + r + ')'} textAnchor="middle" className="mx-dist">{splitLines(M.dist[i], n).map((s, j) => <tspan key={j} x="0" dy={j === 0 ? -(n - 1) * 14 : 28}>{s}</tspan>)}</text>)}
          {MAP_ACC.map(([x, y, s], i) => { const nm = M.acc[i][0].replace(/^Acceso |^| Access$/g, ''); return <text key={i} x={s === 'l' ? x - 24 : x + 24} y={y + 8} textAnchor={s === 'l' ? 'end' : 'start'} className="mx-acc">{nm}</text>; })}
          <g transform="translate(90 190)" fill="#fff"><text x="0" y="-8" textAnchor="middle" className="mx-n">N</text><path d="M0,4 L-10,26 L-3,26 L-3,80 L3,80 L3,26 L10,26 Z" /></g>
          <g transform="translate(90 1320)"><rect width="90" height="5" fill="#fff" /><text x="45" y="-12" textAnchor="middle" className="mx-n sm">500 m</text></g>
        </g>
      </svg>
      {MAP_ACC.map(([x, y], i) => <button key={'a' + i} className={'mx-acc-b' + (isSel(['a', i]) ? ' on' : '')} style={pct(x, y)} aria-pressed={!!isSel(['a', i])} aria-label={M.acc[i][0]} onClick={() => toggle(['a', i])}><span></span></button>)}
      {MAP_PTS.map(([x, y], i) => <button key={'p' + i} className={'spot mx-pt mx-pt-' + i + (isSel(['p', i]) ? ' on' : '')} style={pct(x, y)} aria-pressed={!!isSel(['p', i])} aria-label={(i + 1) + '. ' + M.pts[i][0]} onClick={() => toggle(['p', i])}>{i + 1}</button>)}
      {/* Capas dentro del mapa (solo tablet/móvil, ver .mx-layers en rail.css) */}
      <div ref={layRef} className={'mx-layers' + (layOpen ? ' open' : '')}>
        <button type="button" className="mx-layers-t" aria-label={M.layersT + ": " + M.layers[act][0]} aria-expanded={layOpen} aria-controls="mx-layers-list" onClick={() => { setLayOpen(o => !o); focusView(); }}><Icon name="layers" size={16} color="currentColor" /><span>{M.layers[act][0]}</span>{LAY.filter(([k]) => k === act).map(([k, c, s]) => <i key={k} className={'sw sw-' + s} style={{ '--c': c }}></i>)}<Icon name="chevron-down" size={16} color="currentColor" style={{ transform: layOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-slow) var(--ease-standard)' }} /></button>
        <div id="mx-layers-list" role="group" aria-label={M.layersT} className="mx-layers-list">{LAY.map(([k, c, s]) => <button key={k} type="button" className={act === k ? 'on' : ''} aria-pressed={act === k} onClick={() => { toggleLayer(k); setLayOpen(false); }}><i className={'sw sw-' + s} style={{ '--c': c }}></i><span>{M.layers[k][0]}</span></button>)}</div>
      </div>
      <figcaption className="sr-only">{M.note}</figcaption>
    </figure>
    <div className="mx-side">
      <h3 className="mx-title">{M.hint}</h3>
      <div className="mx-grp mx-grp-refs"><p className="mx-h">{M.refs}</p>
        <ul className="mx-refs">{M.pts.map((p, i) => <li key={i}><button className={isSel(['p', i]) ? 'on' : ''} aria-pressed={!!isSel(['p', i])} onClick={() => toggle(['p', i])}><span className="mx-num">{i + 1}</span><span>{p[0]}</span></button></li>)}</ul></div>
      <div className="mx-grp mx-grp-layers"><p className="mx-h">{M.layersT}</p>
        <ul className="mx-leg">{LAY.map(([k, c, s]) => <li key={k}><button className={act === k ? 'on' : ''} aria-pressed={act === k} onClick={() => toggleLayer(k)}><i className={'sw sw-' + s} style={{ '--c': c }}></i><span>{M.layers[k][0]}</span></button></li>)}</ul></div>
      <div className="mx-grp mx-grp-desc"><p className="mx-h">{M.descT}</p>
        <div ref={panelRef} className="frosted-panel map-info" aria-live="polite">
          <span className="frosted-button-stroke" aria-hidden="true"></span>
          <div key={JSON.stringify(sel)} className="fade-up frosted-panel-in"><small>{info[0]}</small><strong>{info[1]}</strong><span>{info[2]}</span></div>
        </div></div>
    </div>
  </div>;
}
