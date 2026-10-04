export const reduceMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Desplaza hasta una sección, dejando el h2 bajo el header fijo. */
export function goTo(id) {
  const el = document.getElementById(id); if (!el) return;
  const tg = id === 'inicio' ? null : el.querySelector('h2');
  const hd = document.querySelector('header');
  const hh = Math.min(hd ? hd.offsetHeight : 72, 88);
  const top = tg ? tg.getBoundingClientRect().top + window.scrollY - hh - 40 : el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion() ? 'auto' : 'smooth' });
}

/**
 * Desplaza hasta un elemento puntual (p. ej. el formulario o el mapa), dejándolo justo bajo el header fijo.
 * Usa la altura del header ya compacto (el que se ve al hacer scroll): 60px en móvil, 72px en el resto.
 */
export function goToEl(sel, gap = 20) {
  const el = document.querySelector(sel); if (!el) return;
  const hh = window.innerWidth <= 600 ? 60 : 72;
  // Posición de layout (offsetTop): ignora el desplazamiento de la animación de aparición (Reveal) aún no reproducida.
  let y = 0; for (let e = el; e; e = e.offsetParent) y += e.offsetTop;
  const top = y - hh - gap;
  window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion() ? 'auto' : 'smooth' });
}

export const pad2 = x => String(x).padStart(2, '0');
