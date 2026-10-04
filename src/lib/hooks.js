import { useEffect, useState } from 'react';
import { reduceMotion } from './motion.js';

/** true la primera vez que el elemento entra al viewport (y se queda en true). */
export function useReplay(ref, opts) {
  const [v, setV] = useState(reduceMotion());
  useEffect(() => {
    const el = ref.current; if (!el || reduceMotion()) return;
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setV(true); io.disconnect(); } }, opts || { threshold: .15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return v;
}

export function useWidth() {
  const [w, setW] = useState(window.innerWidth);
  useEffect(() => {
    const f = () => setW(window.innerWidth);
    window.addEventListener('resize', f);
    return () => window.removeEventListener('resize', f);
  }, []);
  return w;
}
