/** Botón secundario "frosted" con brillo giratorio (estilos en styles/sections/frosted.css). */
export function FrostedButton({ children, onClick, type = 'button', className = '' }) {
  return <button type={type} className={'frosted-button ' + className} onClick={onClick}>
    <span className="frosted-button-stroke" aria-hidden="true"></span>
    <span className="frosted-button-label">{children}</span>
  </button>;
}
