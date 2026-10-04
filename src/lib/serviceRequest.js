// Comunica "Consultar por este servicio" (Lines) con el formulario de contacto (Contact).
// Se recuerda la última selección por si el formulario se monta después del clic.
let last = null;
const EVENT = 'htp:service';

export function requestService(index) {
  last = index;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: index }));
}

export function onServiceRequest(cb) {
  if (last != null) cb(last);
  const on = e => cb(e.detail);
  window.addEventListener(EVENT, on);
  return () => window.removeEventListener(EVENT, on);
}
