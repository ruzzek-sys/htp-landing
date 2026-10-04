import { Children, cloneElement, createElement, isValidElement, useEffect, useRef, useState } from 'react';

/** Aparece (fade + desplazamiento) al entrar al viewport. Con `stagger`, anima cada hijo en cascada. */
export function Reveal({ children, as = 'div', delay = 0, stagger = 0, distance, direction = 'up', duration, once = true, style, ...rest }) {
  const ref = useRef(null);
  const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [v, setV] = useState(false); // igual en el HTML pregenerado y en el primer render del navegador
  useEffect(() => {
    if (reduce) { setV(true); return; }
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) { setV(true); return; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); if (once) io.disconnect(); }
      else if (!once) setV(false);
    }, { threshold: 0, rootMargin: '0px 0px -12% 0px' }); // umbral 0: los bloques altos (en móvil) también se revelan al entrar
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const dist = distance ?? 'var(--reveal-distance)';
  const off = {
    up: 'translate3d(0,' + dist + ',0)',
    down: 'translate3d(0,calc(-1 * ' + dist + '),0)',
    left: 'translate3d(' + dist + ',0,0)',
    right: 'translate3d(calc(-1 * ' + dist + '),0,0)',
    none: 'none',
  }[direction];
  const dur = duration ?? 'var(--dur-reveal)';
  const kids = stagger ? Children.map(children, (c, i) => isValidElement(c) ? cloneElement(c, {
    style: {
      ...(c.props.style || {}),
      opacity: v ? 1 : 0,
      transform: v ? 'none' : off,
      transition: 'opacity ' + dur + ' var(--ease-emphasis) ' + (delay + i * stagger) + 'ms,transform ' + dur + ' var(--ease-emphasis) ' + (delay + i * stagger) + 'ms',
    },
  }) : c) : children;
  const own = stagger ? {} : {
    opacity: v ? 1 : 0,
    transform: v ? 'none' : off,
    transition: 'opacity ' + dur + ' var(--ease-emphasis) ' + delay + 'ms,transform ' + dur + ' var(--ease-emphasis) ' + delay + 'ms',
  };
  return createElement(as, { ref, ...rest, style: { ...own, ...style } }, kids);
}
