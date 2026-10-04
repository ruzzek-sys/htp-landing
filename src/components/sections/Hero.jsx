import { useEffect, useRef, useState } from 'react';
import { Button, FrostedButton } from '../ui';
import { HeroNetwork } from '../HeroNetwork.jsx';
import { goTo, goToEl, reduceMotion } from '../../lib/motion.js';
// Video del hero: 720p para celular, 1080p para escritorio (VP9) y MP4 H.264 para iPhone con iOS < 17.4 (sin WebM).
import heroVideo720 from '../../assets/video/hero-720.webm';
import heroVideo1080 from '../../assets/video/hero-1080.webm';
import heroVideoMp4 from '../../assets/video/hero-720.mp4';
import heroPoster from '../../assets/video/hero-poster.webp';

export function Hero({ t }) {
  const h = t.hero;
  const [on, setOn] = useState(false);
  // El video empieza a descargarse cuando la página terminó de cargar (antes se ve la portada), para no competir con
  // CSS, fuentes e imágenes en conexiones móviles. Se pausa cuando el hero sale de pantalla y se reanuda al volver.
  const vidRef = useRef(null);
  useEffect(() => {
    const v = vidRef.current; if (!v) return;
    let started = false, visible = true;
    const start = () => { started = true; v.preload = 'auto'; if (visible) v.play().catch(() => {}); };
    if (document.readyState === 'complete') start(); else window.addEventListener('load', start, { once: true });
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (!started) return; if (visible) v.play().catch(() => {}); else v.pause(); });
    io.observe(v); return () => { io.disconnect(); window.removeEventListener('load', start); };
  }, []);
  useEffect(() => { if (reduceMotion()) { setOn(true); return; } const id = requestAnimationFrame(() => requestAnimationFrame(() => setOn(true))); const to = setTimeout(() => setOn(true), 60); return () => { cancelAnimationFrame(id); clearTimeout(to); }; }, []);
  const ln = i => ({ opacity: on ? 1 : 0, transform: on ? 'none' : 'translate3d(0,28px,0)', transition: 'opacity 1400ms var(--ease-gentle) ' + (250 + i * 220) + 'ms,transform 1400ms var(--ease-gentle) ' + (250 + i * 220) + 'ms' });
  return <section id="inicio" aria-labelledby="hero-title" className="hero" data-on-dark="">
    <video ref={vidRef} poster={heroPoster} muted loop playsInline preload="none" aria-label="Vista aérea de Huachipato Terminal Portuario, su muelle y zona industrial en la bahía de San Vicente, Talcahuano" className="hero-img hero-video">
      <source src={heroVideo720} type="video/webm" media="(max-width: 767px)" />
      <source src={heroVideo1080} type="video/webm" />
      <source src={heroVideoMp4} type="video/mp4" />
    </video>
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
