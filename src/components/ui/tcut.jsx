import { useLayoutEffect, useRef, useState } from 'react';

// Corte "travesaño T": una muesca centrada verticalmente en un costado de la tarjeta, con todas sus esquinas redondeadas
// (convexas y cóncavas), como el hueco bajo el travesaño de la T del logotipo HTP.
export function tcutPath(w, h, { side = 'right', band = .3, depth = 16, radius = 14, notchRadius = 8 } = {}) {
  const r = Math.min(radius, w / 4, h / 4);
  const d = Math.min(depth, w / 3);
  const rn = Math.max(0, Math.min(notchRadius, d / 2));
  const len = Math.min(h - 2 * r - 4 * rn, band < 1 ? h * band : band);
  const y1 = (h - len) / 2, y2 = (h + len) / 2;
  // Trazado para costado derecho (sentido horario); el izquierdo se refleja en X invirtiendo el sentido de los arcos.
  const L = side === 'left';
  const X = x => L ? w - x : x;
  const sw = f => L ? 1 - f : f;
  const f = n => Math.round(n * 10) / 10;
  const A = (rr, flag, x, y) => 'A' + f(rr) + ' ' + f(rr) + ' 0 0 ' + sw(flag) + ' ' + f(X(x)) + ' ' + f(y);
  const M = (c, x, y) => c + f(X(x)) + ' ' + f(y);
  return [M('M', r, 0), M('L', w - r, 0), A(r, 1, w, r), M('L', w, y1 - rn), A(rn, 1, w - rn, y1), M('L', w - d + rn, y1), A(rn, 0, w - d, y1 + rn), M('L', w - d, y2 - rn), A(rn, 0, w - d + rn, y2), M('L', w - rn, y2), A(rn, 1, w, y2 + rn), M('L', w, h - r), A(r, 1, w - r, h), M('L', r, h), A(r, 1, 0, h - r), M('L', 0, r), A(r, 1, r, 0)].join(' ') + ' Z';
}

export function useTCut(enabled, opts) {
  const ref = useRef(null);
  const [size, setSize] = useState(null);
  useLayoutEffect(() => {
    if (!enabled || !ref.current) return;
    const el = ref.current;
    const upd = () => setSize({ w: el.offsetWidth, h: el.offsetHeight });
    upd();
    const ro = new ResizeObserver(upd);
    ro.observe(el);
    return () => ro.disconnect();
  }, [enabled]);
  const d = enabled && size && size.w && size.h ? tcutPath(size.w, size.h, opts) : null;
  return { ref, d, size };
}

export function TCutStroke({ d, size, color }) {
  if (!d || !color) return null;
  return <svg aria-hidden width={size.w} height={size.h} viewBox={'0 0 ' + size.w + ' ' + size.h} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}>
    <path d={d} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
  </svg>;
}
