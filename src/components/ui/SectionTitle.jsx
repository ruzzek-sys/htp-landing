export function SectionTitle({ light, bold, align = 'left', onDark, size = 'md', rule = true, style }) {
  // En pantallas angostas el tamaño baja con el ancho para que palabras largas (p. ej. INFRAESTRUCTURA) no se corten.
  const fs = { sm: '18px', md: 'clamp(20px,6.4vw,24px)', lg: 'clamp(24px,7.5vw,32px)' }[size] || 'clamp(20px,6.4vw,24px)';
  return <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', textAlign: align, overflowWrap: 'break-word', ...style }}>
    {light && <span style={{ font: '300 ' + fs + '/1.15 var(--font-corporativa)', textTransform: 'uppercase', color: onDark ? 'var(--htp-azul-200)' : 'var(--htp-azul-500)' }}>{light}</span>}
    <span style={{ font: '600 ' + fs + '/1.15 var(--font-corporativa)', textTransform: 'uppercase', color: onDark ? '#fff' : 'var(--htp-azul)' }}>{bold}</span>
    {rule && <span style={{ width: 'var(--rule-width)', height: 'var(--rule-height)', background: 'var(--rule-accent)', marginTop: 10 }} />}
  </div>;
}
