import { useState } from 'react';
import { Icon } from './Icon.jsx';

export function Checkbox({ label, checked, defaultChecked, onChange, disabled, name, id, style }) {
  const [i, setI] = useState(!!defaultChecked);
  const on = checked ?? i;
  const [f, setF] = useState(false);
  return <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .45 : 1, font: '400 14px/1.3 var(--font-complementaria)', color: 'var(--text-body)', minHeight: 24, ...style }}>
    <input type="checkbox" className="sr-only" id={id} name={name} checked={on} disabled={disabled}
      onFocus={e => setF(e.target.matches(':focus-visible'))}
      onBlur={() => setF(false)}
      onChange={e => { setI(e.target.checked); onChange && onChange(e.target.checked); }} />
    <span aria-hidden="true" style={{
      width: 20, height: 20, flex: 'none', borderRadius: 'var(--radius-xs)',
      border: '1.5px solid ' + (on ? 'var(--htp-azul)' : 'var(--border-strong)'), background: on ? 'var(--htp-azul)' : '#fff',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'background var(--dur-fast)',
      outline: f ? '2px solid var(--focus-color)' : 'none', outlineOffset: 2,
    }}>
      {on && <Icon name="check" size={14} color="#fff" />}
    </span>
    {label}
  </label>;
}
