import { Suspense, startTransition, useEffect, useLayoutEffect, useRef, useState } from 'react';

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
import { COPY } from './data/copy.js';
import { SiteHeader } from './components/sections/SiteHeader.jsx';
import { Hero } from './components/sections/Hero.jsx';
import { Stats } from './components/sections/Stats.jsx';
import { Lines } from './components/sections/Lines.jsx';
import { Cargo } from './components/sections/Cargo.jsx';
import { Rail } from './components/sections/Rail.jsx';
import { Future } from './components/sections/Future.jsx';
import { Contact } from './components/sections/Contact.jsx';
import { SiteFooter } from './components/sections/SiteFooter.jsx';

const LANG_KEY = 'htp-landing-lang';

export default function App() {
  // El HTML se genera en español; el idioma guardado se aplica al cargar (antes de pintar, ver index.html).
  const [lang, setLang] = useState('es');
  useIsoLayoutEffect(() => {
    let saved = null; try { saved = localStorage.getItem(LANG_KEY); } catch (e) { }
    // Como transición: React termina de hidratar las secciones antes de cambiar el idioma (evita el error #421).
    if (saved === 'en') startTransition(() => setLang('en'));
    document.documentElement.classList.remove('lang-pending');
  }, []);
  const [active, setActive] = useState('');
  const anchor = useRef(null);

  // Al cambiar de idioma se vuelve a montar <main>; se guarda la sección visible para mantener la posición de scroll.
  const changeLang = l => {
    if (l === lang) return;
    const secs = [...document.querySelectorAll('main section[id], footer')]; const y = window.scrollY + 72; let a = secs[0];
    for (const s of secs) { if (s.getBoundingClientRect().top + window.scrollY <= y) a = s; }
    if (a) { const top = a.getBoundingClientRect().top + window.scrollY; anchor.current = { id: a.id, tag: a.tagName, off: window.scrollY - top }; }
    const se = document.scrollingElement; se.style.scrollBehavior = 'auto'; setLang(l); try { localStorage.setItem(LANG_KEY, l); } catch (e) { }
  };
  useIsoLayoutEffect(() => {
    const a = anchor.current; if (!a) return; anchor.current = null;
    const el = a.id ? document.getElementById(a.id) : document.querySelector(a.tag.toLowerCase()); if (!el) return;
    const go = () => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + a.off, behavior: 'instant' });
    go(); requestAnimationFrame(() => { go(); document.scrollingElement.style.scrollBehavior = ''; });
  }, [lang]);

  const t = COPY[lang];
  useEffect(() => { document.documentElement.lang = lang === 'es' ? 'es-CL' : 'en'; }, [lang]);
  // Resalta en el menú la sección que ocupa el centro de la pantalla.
  useEffect(() => {
    const ids = t.nav.map(n => n[0]);
    const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }); }, { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach(id => { const el = document.getElementById(id); el && io.observe(el); });
    return () => io.disconnect();
  }, [lang]);

  // Las animaciones en bucle (brillos, cruces, vías del mapa, pulsos) se pausan en las secciones fuera de pantalla.
  useEffect(() => {
    const els = document.querySelectorAll('main section, footer');
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('anim-off', !e.isIntersecting)), { rootMargin: '0px' });
    els.forEach(el => io.observe(el)); return () => io.disconnect();
  }, [lang]);

  return <>
    <a href="#contenido" className="skip-link">{t.skip}</a>
    <SiteHeader t={t} lang={lang} setLang={changeLang} active={active} />
    <main id="contenido" tabIndex={-1} key={lang} className="lang-fade" style={{ overflowAnchor: 'none' }}>
      {/* Cada sección bajo el hero es un límite de Suspense: React las hidrata por separado, cediendo el hilo entre una y otra
          (evita una sola tarea larga al cargar). No hay carga diferida: el contenido viene completo en el HTML. */}
      <Hero t={t} />
      <Suspense fallback={null}><Stats t={t} /></Suspense>
      <Suspense fallback={null}><Lines t={t} /></Suspense>
      <Suspense fallback={null}><Cargo t={t} /></Suspense>
      <div className="rf-wrap"><Suspense fallback={null}><Rail t={t} lang={lang} /></Suspense><Suspense fallback={null}><Future t={t} /></Suspense></div>
      <Suspense fallback={null}><Contact t={t} /></Suspense>
    </main>
    <Suspense fallback={null}><SiteFooter t={t} /></Suspense>
  </>;
}
