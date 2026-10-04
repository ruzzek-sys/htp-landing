import { useId, useState } from 'react';
import { Icon } from './Icon.jsx';
import { boxS, helpS, labelS } from './fields.js';

export function Input({ label, placeholder, value, defaultValue, onChange, type = 'text', error, help, icon, disabled, multiline, rows = 4, required, style }) {
  const [f, setF] = useState(false);
  const hid = useId(); // estable entre el HTML pregenerado y el navegador
  const common = {
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error || help ? hid : undefined,
    required, placeholder, value, defaultValue, disabled,
    onFocus: () => setF(true),
    onBlur: () => setF(false),
    onChange: e => onChange && onChange(e.target.value),
  };
  const b = boxS(f, error, disabled);
  return <label style={{ display: 'flex', flexDirection: 'column', gap: 6, ...style }}>
    {label && <span style={labelS}>{label}{required && <span aria-hidden="true" style={{ color: 'var(--text-accent)' }}> *</span>}</span>}
    <span style={{ position: 'relative', display: 'block' }}>
      {icon && <Icon name={icon} size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: 14, top: 14 }} />}
      {multiline
        ? <textarea rows={rows} {...common} style={{ ...b, height: 'auto', padding: '12px 14px', resize: 'none', fontFamily: 'var(--font-complementaria)' }} />
        : <input type={type} {...common} style={{ ...b, paddingLeft: icon ? 42 : 14 }} />}
    </span>
    {(error || help) && <span id={hid} role={error ? 'alert' : undefined} style={helpS(error)}>{error || help}</span>}
  </label>;
}
