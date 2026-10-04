import { useState } from 'react';
import { TCutStroke, useTCut } from './tcut.jsx';

export function Card({ logo, image, imageAlt, eyebrow, title, children, footer, variant = 'elevated', onClick, imageHeight = 200, cut = 'none', cutDepth = 16, cutBand = .3, cutRadius = 8, style }) {
  const [h, setH] = useState(false);
  const isCut = cut === 'right' || cut === 'left';
  const glassy = variant === 'glass' || variant === 'glass-light';
  const { ref, d, size } = useTCut(isCut, { side: cut, depth: cutDepth, band: cutBand, notchRadius: cutRadius });
  const V = {
    elevated: { background: '#fff', boxShadow: h && onClick ? 'var(--shadow-lg)' : 'var(--shadow-md)' },
    outline: { background: '#fff', border: '1px solid var(--border-subtle)' },
    tint: { background: 'var(--surface-tint)' },
    brand: { background: 'var(--htp-azul)', color: '#fff' },
    glass: {
      background: 'var(--glass-highlight),var(--glass-dark-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
      border: '1px solid ' + (h && onClick ? 'rgba(255,255,255,.32)' : 'var(--glass-dark-border)'), boxShadow: 'var(--shadow-glass)', color: '#fff', borderRadius: 'var(--radius-md)',
    },
    'glass-light': {
      background: 'var(--glass-highlight),var(--glass-light-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
      border: '1px solid var(--glass-light-border)', boxShadow: 'var(--shadow-glass)', borderRadius: 'var(--radius-md)',
    },
  }[variant] || {};
  const dark = variant === 'brand' || variant === 'glass';
  const stroke = {
    outline: 'var(--border-subtle)',
    glass: h && onClick ? 'rgba(255,255,255,.32)' : 'var(--glass-dark-border)',
    'glass-light': 'var(--glass-light-border)',
  }[variant];
  const cutStyle = isCut ? { border: 'none', boxShadow: 'none', borderRadius: 0, clipPath: d ? 'path("' + d + '")' : undefined } : {};
  const pad = isCut ? cut === 'right' ? '24px ' + (24 + cutDepth) + 'px 28px 24px' : '24px 24px 28px ' + (24 + cutDepth) + 'px' : '24px 24px 28px';
  const shadow = isCut && !glassy && (variant === 'elevated' || variant === 'brand') ? h && onClick ? 'drop-shadow(0 14px 22px rgba(10,26,63,.18))' : 'drop-shadow(0 6px 12px rgba(10,26,63,.12))' : undefined;
  return <div
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    onFocus={() => onClick && setH(true)}
    onBlur={() => setH(false)}
    onMouseEnter={() => setH(true)}
    onMouseLeave={() => setH(false)}
    style={{
      display: 'flex', flexDirection: 'column', cursor: onClick ? 'pointer' : 'default', filter: shadow,
      transform: h && onClick ? 'translateY(-3px)' : 'none',
      transition: 'transform var(--dur-base) var(--ease-standard),filter var(--dur-base) var(--ease-standard)',
      ...style,
    }}>
    <div ref={ref} style={{ position: 'relative', display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '100%', ...V, ...cutStyle }}>
      {logo && <div style={{ padding: '24px 24px 0', height: 48, display: 'flex', alignItems: 'center' }}>{logo}</div>}
      {image && <img src={image} alt={imageAlt || ''} loading="lazy" decoding="async" style={{ height: imageHeight, width: '100%', objectFit: 'cover', display: 'block', flex: 'none' }} />}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: pad, flex: 1 }}>
        {eyebrow && <span style={{ font: '600 11px/1 var(--font-corporativa)', letterSpacing: 'var(--ls-overline)', textTransform: 'uppercase', color: dark ? 'var(--htp-coral)' : 'var(--text-accent)' }}>{eyebrow}</span>}
        {title && <h3 style={{ margin: 0, font: '700 20px/1.25 var(--font-complementaria)', color: dark ? '#fff' : 'var(--htp-azul)' }}>{title}</h3>}
        {children && <div style={{ font: '400 15px/1.55 var(--font-complementaria)', color: dark ? 'var(--htp-azul-100)' : 'var(--text-muted)' }}>{children}</div>}
        {footer && <div style={{ marginTop: 'auto', paddingTop: 8 }}>{footer}</div>}
      </div>
      {isCut && <TCutStroke d={d} size={size} color={stroke} />}
    </div>
  </div>;
}
