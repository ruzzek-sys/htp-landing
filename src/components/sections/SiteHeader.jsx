import { useEffect, useState } from 'react';
import { Button, IconButton, LanguageToggle, Logo, NavLink } from '../ui';
import { useWidth } from '../../lib/hooks.js';
import { goTo, reduceMotion } from '../../lib/motion.js';

export function SiteHeader({ t, lang, setLang, active }) {
  const w = useWidth(); const compact = w < 1240;
  const [sc, setSc] = useState(window.scrollY > 40); const [open, setOpen] = useState(false);
  useEffect(() => { const f = () => setSc(window.scrollY > 40); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f); }, []);
  useEffect(() => { if (!compact) setOpen(false); }, [compact]);
  useEffect(() => { if (!open) return; const k = e => { if (e.key === 'Escape') setOpen(false); }; document.addEventListener('keydown', k); return () => document.removeEventListener('keydown', k); }, [open]);
  const solid = sc || open;
  const links = (col) => t.nav.map(([id, l]) => <NavLink key={id} href={'#' + id} active={active === id} onDark={!solid} onClick={e => { e && e.preventDefault && e.preventDefault(); goTo(id); setOpen(false); }} style={col ? { height: 52, fontSize: 14 } : undefined}>{l}</NavLink>);
  return <header className={'hdr' + (solid ? ' solid' : '')} data-on-dark={solid ? undefined : ''}>
    <div className="wrap hdr-in">
      <a href="#inicio" aria-label="Huachipato Terminal Portuario — Inicio" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' }); }} className="hdr-logo">
        <span className={'logo-x' + (solid ? '' : ' on')}><Logo variant="white" height={w < 600 ? 26 : 32} /></span>
        <span className={'logo-x' + (solid ? ' on' : '')}><Logo height={w < 600 ? 26 : 32} /></span>
      </a>
      {!compact && <nav aria-label={t.navLabel} className="hdr-nav">{links(false)}</nav>}
      <div className="hdr-act">
        <LanguageToggle value={lang} onChange={setLang} onDark={!solid} glass={!solid && w >= 600} short={w < 600} style={w < 600 ? { width: 44, height: 44, minWidth: 44, padding: 0, borderRadius: '50%' } : compact ? { height: 40 } : undefined} />
        {!compact && <Button size="sm" variant="primary" onClick={() => goTo('contacto')}>{t.navCta}</Button>}
        {compact && <IconButton icon={open ? 'x' : 'menu'} label={open ? t.menuClose : t.menuOpen} variant={solid ? 'ghost' : 'light'} size={44} onClick={() => setOpen(o => !o)} aria-expanded={open} aria-controls="menu-movil" />}
      </div>
    </div>
    {compact && open && <nav id="menu-movil" aria-label={t.navLabel} className="wrap hdr-mob">{links(true)}<Button fullWidth size="lg" variant="primary" onClick={() => { setOpen(false); goTo('contacto'); }} style={{ marginTop: 12 }}>{t.navCta}</Button></nav>}
  </header>;
}
