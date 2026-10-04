import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'es');
  const [active, setActive] = useState('');
  const anchor = useRef(null);

  // Al cambiar de idioma se vuelve a montar <main>; se guarda la sección visible para mantener la posición de scroll.
  const changeLang = l => {
    if (l === lang) return;
    const secs = [...document.querySelectorAll('main section[id], footer')]; const y = window.scrollY + 72; let a = secs[0];
    for (const s of secs) { if (s.getBoundingClientRect().top + window.scrollY <= y) a = s; }
    if (a) { const top = a.getBoundingClientRect().top + window.scrollY; anchor.current = { id: a.id, tag: a.tagName, off: window.scrollY - top }; }
    const se = document.scrollingElement; se.style.scrollBehavior = 'auto'; setLang(l);
  };
  useLayoutEffect(() => {
    const a = anchor.current; if (!a) return; anchor.current = null;
    const el = a.id ? document.getElementById(a.id) : document.querySelector(a.tag.toLowerCase()); if (!el) return;
    const go = () => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + a.off, behavior: 'instant' });
    go(); requestAnimationFrame(() => { go(); document.scrollingElement.style.scrollBehavior = ''; });
  }, [lang]);

  const t = COPY[lang];
  useEffect(() => { localStorage.setItem(LANG_KEY, lang); document.documentElement.lang = lang === 'es' ? 'es-CL' : 'en'; }, [lang]);
  // Resalta en el menú la sección que ocupa el centro de la pantalla.
  useEffect(() => {
    const ids = t.nav.map(n => n[0]);
    const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }); }, { rootMargin: '-45% 0px -50% 0px' });
    ids.forEach(id => { const el = document.getElementById(id); el && io.observe(el); });
    return () => io.disconnect();
  }, [lang]);

  return <>
    <a href="#contenido" className="skip-link">{t.skip}</a>
    <SiteHeader t={t} lang={lang} setLang={changeLang} active={active} />
    <main id="contenido" tabIndex={-1} key={lang} className="lang-fade" style={{ overflowAnchor: 'none' }}>
      <Hero t={t} /><Stats t={t} /><Lines t={t} /><Cargo t={t} /><div className="rf-wrap"><Rail t={t} lang={lang} /><Future t={t} /></div><Contact t={t} />
    </main>
    <SiteFooter t={t} />
  </>;
}
