// Estilos compartidos por Input y Select.
export const labelS = { font: '600 12px/1.2 var(--font-corporativa)', color: 'var(--htp-azul)', letterSpacing: '.02em' };

export const helpS = e => ({ font: '400 12px/1.3 var(--font-complementaria)', color: e ? 'var(--htp-error)' : 'var(--text-subtle)' });

export const boxS = (f, e, d) => ({
  height: 46,
  padding: '0 14px',
  border: '1.5px solid ' + (e ? 'var(--htp-error)' : f ? 'var(--htp-azul)' : 'var(--border-strong)'),
  borderRadius: 'var(--radius-xs)',
  background: d ? 'var(--surface-soft)' : '#fff',
  boxShadow: f ? '0 0 0 3px rgba(0,55,148,.12)' : 'none',
  font: '400 15px/1.2 var(--font-complementaria)',
  color: 'var(--text-body)',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color var(--dur-fast),box-shadow var(--dur-fast)',
});
