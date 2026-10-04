# Project instructions

- Do NOT run the background verifier after each change. Always call ready_for_verification with skip_verifier_agent: true, unless the user explicitly asks for a design check/verification.

## Contexto

Landing bilingüe (ES/EN) de Huachipato Terminal Portuario. Vite 8 + React 18, CSS por sección y HTML pregenerado en el
build con hidratación. La referencia completa está en [README.md](README.md): arquitectura, secciones, breakpoints,
recursos, checklist para secciones nuevas y auditoría. **Léelo antes de cambios no triviales.**

El usuario escribe en español: responde y escribe commits y comentarios de código en español.

## Reglas obligatorias

### Hidratación (el HTML se genera en Node, sin navegador)

- Nada de `window`, `document`, `localStorage`, `matchMedia`, ancho de pantalla ni `prefers-reduced-motion` en el render
  ni en `useState(...)` iniciales. Estado inicial fijo y ajuste en `useEffect`.
- Lo que depende del ancho de pantalla se resuelve con **CSS** (media queries), no con JS en el render.
- IDs con `useId`, nunca `Math.random`. `useLayoutEffect` solo vía `useIsoLayoutEffect`.
- Secciones nuevas bajo el hero: dentro de `<Suspense fallback={null}>` en `App.jsx`.
- Verifica con `npm run build && npm run preview`, no solo con `dev` (dev no hidrata). Revisa la consola: no deben aparecer
  `Minified React error #418/#421/#423/#425`.

### Estilos y responsivo

- CSS en `src/styles/sections/<seccion>.css`. Ajustes nuevos al final del archivo, con un comentario que diga el porqué.
  No cambies el orden de imports en `styles/index.css` (cascada original).
- Tailwind va sin preflight y en capas: el CSS del sitio siempre gana. No migres efectos existentes a Tailwind.
- Componentes con estilos inline (`Button`, `NavLink`, `LanguageToggle`, `SectionTitle`) solo se sobrescriben desde CSS con `!important`.
- Nunca debe haber desborde horizontal: `main` y `.ft` tienen `overflow-x: clip`. Un elemento más ancho que la pantalla
  corta el lado derecho de todo el sitio en móvil.
- `width:100%` con borde → `box-sizing:border-box`. No combines `aspect-ratio` con `min-height` en anchos fluidos.
  Grillas de 1 columna con `minmax(0,1fr)`.
- Zonas táctiles ≥44 px. Campos de formulario a 16 px en móvil. El header fijo mide 72 px (60 px en ≤600): descuéntalo en
  sticky y scrolls (`goTo`, `goToEl`).
- Respeta `prefers-reduced-motion` (CSS y `reduceMotion()`).

### Contenido

- Todo texto visible va en `src/data/copy.js` en **`es` y `en`** (el mapa, en `map-copy.js`). Nunca hardcodear textos en componentes.
- Anclas que usan los botones del hero: `#formulario` y `#mapa-terreno`. No las renombres sin actualizar `Hero.jsx`.

### Rendimiento (presupuesto: ~1,7 MB al abrir en celular)

- Imágenes en WebP, tamaño acorde a como se muestran, versión chica + `srcSet`/`sizes` cuando corresponda, `loading="lazy"` bajo el pliegue.
- Fuentes: solo WOFF2 recortadas a latín. Caracteres o pesos nuevos → regenerar (receta en README).
- Video del hero: tres variantes + portada. Si cambia el video, cambia el contraste del texto: vuelve a medirlo.
- Animaciones: preferir `transform`/`opacity`. Las animaciones en bucle se pausan solas fuera de pantalla (`.anim-off`).
- No agregues dependencias de runtime sin necesidad. Las herramientas puntuales (`sharp`, `subset-font`, `lighthouse`,
  `playwright`) se usan con `npm i --no-save` o `npx`, sin guardarlas en `package.json`.

### Accesibilidad

- Contraste WCAG AA: 4,5:1 texto normal y 3:1 texto grande. El hero se midió sobre los cuadros más claros del video:
  si tocas velo/degradado, video o colores del texto del hero, mide de nuevo.
- Texto para lectores de pantalla con `.sr-only`. No uses `aria-label` en `<span>`/`<div>` sin rol.
- Mantén los patrones existentes: `role="tablist"` con flechas, `aria-pressed`, `aria-live`, foco visible.

## Flujo de trabajo

- Antes de cambios grandes: `git status` limpio. **Un commit por cambio lógico**, mensaje en español (título + cuerpo con
  qué y por qué), terminado en la línea `Co-Authored-By` que indique el sistema.
- Antes de dar algo por terminado, corre la **Auditoría** del README, como mínimo:
  - build sin advertencias;
  - sin errores de hidratación;
  - sin desborde horizontal en 320/375/768/1440 px;
  - interacciones de la sección tocada en táctil;
  - Lighthouse si el cambio afecta carga o recursos.
- Al detener servidores con `pkill -f`, usa un patrón que no coincida con tu propio comando (p. ej. `pkill -f "vite --port 519[9]"`):
  si coincide, el comando se mata a sí mismo.
- Pendientes conocidos (formulario simulado, enlaces legales en `#`, hosting): ver README.
