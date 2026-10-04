import { useEffect, useState } from 'react';
import { Button, FrostedButton } from '../ui';
import { HeroNetwork } from '../HeroNetwork.jsx';
import { goTo, goToEl, reduceMotion } from '../../lib/motion.js';
import heroVideo from '../../assets/video/hero-video.webm';

export function Hero({ t }) {
  const h = t.hero;
  const [on, setOn] = useState(reduceMotion());
  useEffect(() => { if (reduceMotion()) return; const id = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true))); const to = setTimeout(() => setOn(true), 60); return () => { cancelAnimationFrame(id); clearTimeout(to); }; }, []);
  const ln = i => ({ opacity: on ? 1 : 0, transform: on ? 'none' : 'translate3d(0,28px,0)', transition: 'opacity 1400ms var(--ease-gentle) ' + (250 + i * 220) + 'ms,transform 1400ms var(--ease-gentle) ' + (250 + i * 220) + 'ms' });
  return <section id="inicio" aria-labelledby="hero-title" className="hero" data-on-dark="">
    <video src={heroVideo} autoPlay muted loop playsInline preload="auto" aria-label="Vista aérea de Huachipato Terminal Portuario, su muelle y zona industrial en la bahía de San Vicente, Talcahuano" className="hero-img hero-video"></video>
    <div className="hero-shade" aria-hidden="true"></div>
    <HeroNetwork />
    <div className="wrap hero-in">
      <p className="eyebrow on-dark" style={ln(0)}>{h.eyebrow}</p>
      <h1 id="hero-title" className="hero-h1"><span className="sr-only">Huachipato Terminal Portuario (HTP): </span>{h.title.map((l, i) => <span key={l} style={{ display: 'block', ...ln(i + 1) }}>{l}</span>)}</h1>
      <p className="hero-sub" style={ln(3)}>{h.sub}</p>
      <div className="hero-cta" style={ln(4)}>
        <Button size="lg" variant="primary" iconRight="arrow-right" onClick={() => goToEl('#formulario')}>{h.cta}</Button>
        <FrostedButton onClick={() => goToEl('#mapa-terreno')}>{h.cta2}</FrostedButton>
      </div>
    </div>
    <button className="hero-scroll" onClick={() => goTo('cifras')} aria-label={h.scroll}><span>{h.scroll}</span><span className="hero-scroll-line"><span></span></span></button>
    <div aria-hidden="true" className="hero-bar" style={{ transform: on ? 'scaleX(1)' : 'scaleX(0)' }}></div>
  </section>;
}
