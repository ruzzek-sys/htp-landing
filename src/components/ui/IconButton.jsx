import { useState } from 'react';
import { Icon } from './Icon.jsx';

const V = {
  solid: { rest: 'var(--htp-azul)', hover: 'var(--action-secondary-hover)', color: '#fff', lift: true },
  orange: { rest: 'var(--htp-degradado-naranja-aa)', hover: 'var(--htp-degradado-naranja-aa-hover)', color: '#fff', lift: true },
  outline: { rest: '#fff', hover: 'var(--surface-tint)', color: 'var(--htp-azul)', border: '1.5px solid var(--border-strong)', borderHover: '1.5px solid var(--htp-azul)' },
  ghost: { rest: 'transparent', hover: 'var(--surface-tint)', color: 'var(--htp-azul)' },
  light: { rest: 'rgba(255,255,255,.08)', hover: 'rgba(255,255,255,.2)', color: '#fff', border: '1.5px solid rgba(255,255,255,.5)', borderHover: '1.5px solid #fff' },
};

export function IconButton({ icon, label, variant = 'outline', size = 40, onClick, disabled, style, type = 'button', ...rest }) {
  const [h, setH] = useState(false);
  const [p, setP] = useState(false);
  const v = V[variant] || V.outline;
  const act = h && !disabled;
  const pr = p && !disabled;
  const ease = 'var(--ease-standard)';
  return <button type={type} {...rest} aria-label={label} title={label} disabled={disabled} onClick={onClick}
    onMouseEnter={() => setH(true)}
    onMouseLeave={() => { setH(false); setP(false); }}
    onMouseDown={() => setP(true)}
    onMouseUp={() => setP(false)}
    onFocus={e => { if (e.target.matches && e.target.matches(':focus-visible')) setH(true); }}
    onBlur={() => { setH(false); setP(false); }}
    style={{
      position: 'relative', isolation: 'isolate', overflow: 'hidden', width: size, height: size, borderRadius: '50%',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .45 : 1, padding: 0,
      background: v.rest, color: v.color, border: act && v.borderHover || v.border || 'none',
      boxShadow: v.lift && act && !pr ? '0 8px 18px rgba(10,26,63,.18)' : '0 0 0 rgba(10,26,63,0)',
      transform: pr ? 'scale(.94)' : act ? 'translateY(-1px)' : 'none',
      transition: 'transform var(--dur-slow) ' + ease + ',box-shadow var(--dur-slow) ' + ease + ',border-color var(--dur-slow) ' + ease,
      WebkitTapHighlightColor: 'transparent',
      ...style,
    }}>
    <span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: v.hover, opacity: act ? 1 : 0, transition: 'opacity var(--dur-slow) ' + ease, zIndex: -1 }} />
    <span aria-hidden="true" style={{ position: 'absolute', inset: 0, background: 'rgba(10,26,63,.14)', opacity: pr ? 1 : 0, transition: 'opacity var(--dur-fast) ' + ease, zIndex: -1 }} />
    <Icon name={icon} size={Math.round(size * .45)} />
  </button>;
}
