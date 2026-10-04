import { useEffect, useState } from 'react';
import { reduceMotion } from './motion.js';

/** true la primera vez que el elemento entra al viewport (y se queda en true). */
export function useReplay(ref, opts) {
  const [v, setV] = useState(false); // igual en el HTML pregenerado y en el primer render del navegador
  useEffect(() => {
    if (reduceMotion()) { setV(true); return; }
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setV(true); io.disconnect(); } }, opts || { threshold: .15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return v;
}
