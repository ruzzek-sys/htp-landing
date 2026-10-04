import { useState } from 'react';

export function NavLink({ children, active, onClick, onDark, href, style }) {
  const [h, setH] = useState(false);
  const ease = 'var(--ease-standard)';
  const c = onDark ? '#fff' : 'var(--htp-azul)';
  return <a href={href || '#'} aria-current={active ? 'page' : undefined}
    onClick={e => { if (onClick) { e.preventDefault(); onClick(); } }}
    onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onFocus={() => setH(true)} onBlur={() => setH(false)}
    style={{
      position: 'relative', display: 'inline-flex', alignItems: 'center', height: 32,
      font: '600 12px/1 var(--font-corporativa)', letterSpacing: 'var(--ls-nav)', textTransform: 'uppercase',
      color: c, textDecoration: 'none', paddingTop: 2, ...style,
    }}>
    {children}
    <span aria-hidden="true" style={{
      position: 'absolute', left: 0, right: 0, bottom: 0, height: 2, background: active ? c : 'var(--htp-coral)',
      transform: active || h ? 'scaleX(1)' : 'scaleX(0)', transformOrigin: 'left',
      transition: 'transform var(--dur-slow) ' + ease + ',background-color var(--dur-slow) ' + ease,
    }} />
  </a>;
}
