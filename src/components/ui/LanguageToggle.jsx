import { useState } from 'react';

export function LanguageToggle({ value = 'es', onChange, onDark, short, glass, style }) {
  const next = value === 'es' ? 'en' : 'es';
  const [h, setH] = useState(false);
  const [p, setP] = useState(false);
  const ease = 'var(--ease-standard)';
  const c = onDark ? '#fff' : 'var(--htp-azul)';
  return <button type="button" lang={next === 'en' ? 'en' : 'es'} aria-label={value === 'es' ? 'Switch to English' : 'Cambiar a español'}
    onClick={() => onChange && onChange(next)}
    onMouseEnter={() => setH(true)}
    onMouseLeave={() => { setH(false); setP(false); }}
    onMouseDown={() => setP(true)}
    onMouseUp={() => setP(false)}
    onFocus={e => { if (e.target.matches && e.target.matches(':focus-visible')) setH(true); }}
    onBlur={() => setH(false)}
    style={{
      position: 'relative', isolation: 'isolate', overflow: 'hidden', height: 34, minWidth: 44, padding: '0 18px',
      borderRadius: 'var(--radius-pill)', border: '1.5px solid ' + c, color: c,
      // glass: mismo fondo que el botón secundario del hero (.frosted-button::before en frosted.css)
      background: glass ? 'rgb(10 26 63 / 34%)' : 'transparent', backdropFilter: glass ? 'blur(6px)' : undefined, WebkitBackdropFilter: glass ? 'blur(6px)' : undefined,
      font: '600 11px/1 var(--font-corporativa)', letterSpacing: 'var(--ls-nav)', textTransform: 'uppercase', cursor: 'pointer',
      transform: p ? 'scale(.97)' : 'none', transition: 'transform var(--dur-slow) ' + ease, WebkitTapHighlightColor: 'transparent',
      ...style,
    }}>
    <span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: onDark ? 'rgba(255,255,255,.16)' : 'var(--surface-tint)', opacity: h ? 1 : 0, transition: 'opacity var(--dur-slow) ' + ease, zIndex: -1 }} />
    {short ? (value === 'es' ? 'EN' : 'ES') : value === 'es' ? 'English' : 'Español'}
  </button>;
}
