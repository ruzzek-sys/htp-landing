import { useEffect, useRef } from 'react';
import { reduceMotion } from '../lib/motion.js';

/** Canvas animado del hero: puntos que se conectan con un origen mediante curvas, en ciclos. */
export function HeroNetwork() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current; if (!canvas || reduceMotion()) return;
    const ctx = canvas.getContext('2d');
    const C = { color: '177,191,218', dotCount: 22, dotRadius: 2.4, appearWindow: 1800, gapBeforeLines: 600, lineStagger: 2600, lineDuration: 3200, tailLength: .55, curve: .35, holdAfter: 1100, fadeOut: 600, pauseBetween: 600, originX: -.08, originY: .5, areaX: [.4, .97], areaY: [.12, .9] };
    let W, H, DPR, center, dots = [], cycleStart = 0, fadeStart = 0, raf = 0, visible = true;
    const rand = (a, b) => a + Math.random() * (b - a);
    const easeInOut = t => -(Math.cos(Math.PI * t) - 1) / 2;
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    const bez = (p0, p1, p2, t) => { const u = 1 - t; return { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y }; };
    const resize = () => { DPR = Math.min(window.devicePixelRatio || 1, 2); const r = canvas.getBoundingClientRect(); W = r.width; H = r.height; canvas.width = W * DPR; canvas.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); const mob = W < 760; center = { x: W * C.originX, y: H * (mob ? .7 : C.originY) }; };
    const newCycle = now => {
      cycleStart = now; dots = []; const mob = W < 760; const ax = mob ? [.05, .95] : C.areaX, ay = mob ? [.45, .95] : C.areaY; const n = mob ? 14 : C.dotCount;
      for (let i = 0; i < n; i++) {
        const p = { x: rand(W * ax[0], W * ax[1]), y: rand(H * ay[0], H * ay[1]) }; const mx = (center.x + p.x) / 2, my = (center.y + p.y) / 2, dx = p.x - center.x, dy = p.y - center.y, k = rand(-C.curve, C.curve);
        const start = C.appearWindow + C.gapBeforeLines + rand(0, C.lineStagger); dots.push({ p, ctrl: { x: mx - dy * k, y: my + dx * k }, appearAt: rand(0, C.appearWindow), start });
      }
      fadeStart = Math.max(...dots.map(d => d.start + C.lineDuration * (1 + C.tailLength))) + C.holdAfter;
    };
    const drawLine = (d, headT, tailT) => {
      const steps = 24; ctx.lineCap = 'round'; let prev = bez(center, d.ctrl, d.p, tailT);
      for (let i = 1; i <= steps; i++) {
        const t = tailT + (headT - tailT) * (i / steps); const pt = bez(center, d.ctrl, d.p, t); const a = Math.pow(i / steps, .6);
        ctx.strokeStyle = 'rgba(' + C.color + ',' + (a * .5) + ')'; ctx.lineWidth = .5 + a * .6; ctx.beginPath(); ctx.moveTo(prev.x, prev.y); ctx.lineTo(pt.x, pt.y); ctx.stroke(); prev = pt;
      }
    };
    // Limitado a ~30 fps: la animación es lenta y así libera la mitad del trabajo del procesador (clave en móviles).
    let last = 0;
    const frame = now => {
      raf = 0; if (!visible) return;
      if (now - last < 32) { raf = requestAnimationFrame(frame); return; } last = now; const t = now - cycleStart; ctx.clearRect(0, 0, W, H);
      const fadeT = Math.min(Math.max((t - fadeStart) / C.fadeOut, 0), 1), ga = 1 - fadeT;
      const oa = Math.min(Math.max((t - C.appearWindow) / 600, 0), 1) * ga;
      if (oa > 0) { ctx.fillStyle = 'rgba(255,255,255,' + (.7 * oa) + ')'; ctx.shadowColor = 'rgba(' + C.color + ',' + oa + ')'; ctx.shadowBlur = 14; ctx.beginPath(); ctx.arc(center.x, center.y, 4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0; }
      for (const d of dots) {
        const local = (t - d.start) / C.lineDuration;
        if (local > 0) { const head = easeInOut(Math.min(local, 1)); const tail = easeInOut(Math.min(Math.max(local - C.tailLength, 0), 1)); if (tail < 1) drawLine(d, head, Math.min(tail, head)); }
        const dt = Math.min(Math.max((t - d.appearAt) / 500, 0), 1);
        if (dt > 0) {
          const arrived = local >= 1 ? Math.max(0, 1 - (local - 1) * 2) : 0; const r = C.dotRadius * easeOut(dt) * (1 - fadeT * .5) * (1 + arrived * .8);
          ctx.fillStyle = 'rgba(' + C.color + ',' + (.7 * ga) + ')'; ctx.shadowColor = 'rgba(' + C.color + ',' + (.45 * ga) + ')'; ctx.shadowBlur = 8 + arrived * 10; ctx.beginPath(); ctx.arc(d.p.x, d.p.y, r, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        }
      }
      if (t > fadeStart + C.fadeOut + C.pauseBetween) newCycle(now);
      raf = requestAnimationFrame(frame);
    };
    const onResize = () => { if (!begun) return; resize(); newCycle(performance.now()); };
    // Arranca cuando la página terminó de cargar, para no competir con la carga inicial ni con la hidratación.
    let begun = false;
    const begin = () => { begun = true; resize(); newCycle(performance.now()); raf = requestAnimationFrame(frame); };
    if (document.readyState === 'complete') begin(); else window.addEventListener('load', begin, { once: true });
    window.addEventListener('resize', onResize);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (begun && visible && !raf) raf = requestAnimationFrame(frame); }); io.observe(canvas);
    return () => { window.removeEventListener('load', begin); cancelAnimationFrame(raf); window.removeEventListener('resize', onResize); io.disconnect(); };
  }, []);
  return <canvas ref={ref} className="hero-net" aria-hidden="true"></canvas>;
}
