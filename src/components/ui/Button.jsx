import { useState } from 'react';
import { Icon } from './Icon.jsx';

const SIZES = {
  sm: { h: 36, px: 18, fs: 11 },
  md: { h: 44, px: 24, fs: 12 },
  lg: { h: 52, px: 32, fs: 13 },
};
// Cada variante: fondo en reposo (rest), capa hover que aparece con crossfade de opacidad (suave y sin saltos entre degradados).
const VARIANTS = {
  primary: { rest: 'var(--htp-degradado-cta)', hover: 'var(--htp-degradado-cta-hover)', color: 'var(--action-primary-text)', lift: true },
  'primary-light': { rest: 'var(--htp-degradado-naranja-aa)', hover: 'var(--htp-degradado-naranja-aa-hover)', color: '#fff', lift: true },
  gradient: { rest: 'var(--htp-degradado-aa)', hover: 'var(--htp-degradado-aa-hover)', color: '#fff', lift: true },
  secondary: { rest: 'var(--action-secondary)', hover: 'var(--action-secondary-hover)', color: '#fff', lift: true },
  outline: { rest: 'transparent', hover: 'var(--surface-tint)', color: 'var(--htp-azul)', border: '1.5px solid var(--htp-azul)' },
  'outline-light': { rest: 'transparent', hover: 'rgba(255,255,255,.14)', color: '#fff', border: '1.5px solid #fff' },
  ghost: { rest: 'transparent', hover: 'var(--surface-tint)', color: 'var(--htp-azul)' },
  link: { link: true },
};

export function Button({ variant = 'primary', size = 'md', children, icon, iconRight, disabled, fullWidth, onClick, type = 'button', style }) {
  const [h, setH] = useState(false);
  const [p, setP] = useState(false);
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.primary;
  const act = h && !disabled;
  const pr = p && !disabled;
  const ease = 'var(--ease-standard)';
  const handlers = {
    onMouseEnter: () => setH(true),
    onMouseLeave: () => { setH(false); setP(false); },
    onMouseDown: () => setP(true),
    onMouseUp: () => setP(false),
    onFocus: e => { if (e.target.matches && e.target.matches(':focus-visible')) setH(true); },
    onBlur: () => { setH(false); setP(false); },
  };
  const base = {
    position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    font: '700 ' + s.fs + 'px/1 var(--font-corporativa)', letterSpacing: 'var(--ls-button)', textTransform: 'uppercase',
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .45 : 1, whiteSpace: 'nowrap',
    width: fullWidth ? '100%' : undefined, WebkitTapHighlightColor: 'transparent',
  };
  const iconR = iconRight && <Icon name={iconRight} size={s.fs + 6} style={{ transform: act ? 'translateX(3px)' : 'none', transition: 'transform var(--dur-slow) ' + ease }} />;

  if (v.link) {
    return <button type={type} disabled={disabled} onClick={onClick} {...handlers} style={{
      ...base, background: 'none', border: 'none', padding: 0, minHeight: 24,
      color: act ? 'var(--htp-naranja-aa)' : 'var(--htp-azul)',
      textDecoration: 'underline', textUnderlineOffset: 3, textDecorationColor: act ? 'currentColor' : 'transparent',
      transition: 'color var(--dur-slow) ' + ease + ',text-decoration-color var(--dur-slow) ' + ease,
      ...style,
    }}>
      {icon && <Icon name={icon} size={s.fs + 6} />}{children}{iconR}
    </button>;
  }
  return <button type={type} disabled={disabled} onClick={onClick} {...handlers} style={{
    ...base, height: s.h, padding: '0 ' + s.px + 'px', borderRadius: 'var(--radius-pill)', border: v.border || 'none',
    background: v.rest, color: v.color, overflow: 'hidden', isolation: 'isolate',
    boxShadow: v.lift && act && !pr ? '0 8px 18px rgba(10,26,63,.18)' : '0 0 0 rgba(10,26,63,0)',
    transform: pr ? 'scale(.98)' : v.lift && act ? 'translateY(-1px)' : 'none',
    transition: 'transform var(--dur-slow) ' + ease + ',box-shadow var(--dur-slow) ' + ease,
    ...style,
  }}>
    <span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: v.hover, opacity: act ? 1 : 0, transition: 'opacity var(--dur-slow) ' + ease, zIndex: -1 }} />
    <span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'rgba(10,26,63,.14)', opacity: pr ? 1 : 0, transition: 'opacity var(--dur-fast) ' + ease, zIndex: -1 }} />
    {icon && <Icon name={icon} size={s.fs + 6} />}{children}{iconR}
  </button>;
}
