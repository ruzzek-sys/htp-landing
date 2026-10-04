import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

// Sin <StrictMode>: su doble ejecución de efectos en desarrollo dispara animaciones de "primer render"
// (p. ej. el giro del brillo en Carga y en el mapa) que el sitio original no muestra al cargar.
// En producción el HTML viene pregenerado (scripts/prerender.mjs) y se hidrata; en desarrollo se renderiza desde cero.
const root = document.getElementById('root');
if (root.hasChildNodes()) hydrateRoot(root, <App />);
else createRoot(root).render(<App />);
