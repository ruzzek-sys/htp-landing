import { useId, useState } from 'react';
import { Icon } from './Icon.jsx';
import { boxS, helpS, labelS } from './fields.js';

export function Select({ required, label, options = [], value, defaultValue, onChange, placeholder, error, help, disabled, style }) {
  const [f, setF] = useState(false);
  const hid = useId(); // estable entre el HTML pregenerado y el navegador
  return <label style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
    {label && <span style={labelS}>{label}{required && <span aria-hidden="true" style={{ color: 'var(--text-accent)' }}> *</span>}</span>}
    <span style={{ position: 'relative', display: 'block' }}>
      <select
        aria-invalid={error ? true : undefined}
        aria-describedby={error || help ? hid : undefined}
        required={required}
        value={value}
        defaultValue={value === undefined ? defaultValue ?? '' : undefined}
        disabled={disabled}
        onFocus={() => setF(true)}
        onBlur={() => setF(false)}
        onChange={e => onChange && onChange(e.target.value)}
        style={{ ...boxS(f, error, disabled), appearance: 'none', WebkitAppearance: 'none', paddingRight: 40, cursor: 'pointer' }}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(o => typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <Icon name="chevron-down" size={18} color="var(--htp-azul)" style={{ position: 'absolute', right: 14, top: 14, pointerEvents: 'none' }} />
    </span>
    {(error || help) && <span id={hid} role={error ? 'alert' : undefined} style={helpS(error)}>{error || help}</span>}
  </label>;
}
