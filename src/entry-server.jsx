import { renderToString } from 'react-dom/server';
import App from './App.jsx';

/** Render a HTML en el build (scripts/prerender.mjs): la página llega con su contenido y React solo la hidrata. */
export function render() {
  return renderToString(<App />);
}
