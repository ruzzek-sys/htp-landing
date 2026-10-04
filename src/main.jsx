import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/index.css';

// Sin <StrictMode>: su doble ejecución de efectos en desarrollo dispara animaciones de "primer render"
// (p. ej. el giro del brillo en Carga y en el mapa) que el sitio original no muestra al cargar.
createRoot(document.getElementById('root')).render(<App />);
