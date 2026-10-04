# HTP Landing · Huachipato Terminal Portuario

Landing bilingüe (ES/EN) de HTP: una sola página con hero en video, cifras, líneas de negocio, tipos de carga,
conectividad con mapa interactivo, galería "Visión 2050" y formulario de contacto.

- **Stack:** Vite 8 + React 18 + CSS del design system HTP (Tailwind v4 disponible, sin preflight).
- **Render:** el HTML de la página se genera en el build (prerender) y React lo hidrata en el navegador.
- **Despliegue:** sitio estático (`dist/`), con rutas relativas (`base: './'`): funciona en la raíz o en una subcarpeta.
- **Estado:** responsivo de 320 px a 1920 px y optimizado. Lighthouse: móvil 86–89, escritorio 99–100,
  accesibilidad / buenas prácticas / SEO 100.

> Agentes IA: lean también [CLAUDE.md](CLAUDE.md), que resume las reglas obligatorias.

---

## Comandos

```bash
npm install
npm run dev                 # desarrollo con HMR (http://localhost:5173); render solo en el cliente
npm run dev -- --host       # igual, accesible desde el celular en la misma red (http://<IP-del-PC>:5173)
npm run build               # build de producción en dist/: cliente + SSR + prerender (ver "Arquitectura")
npm run preview             # sirve dist/ (http://localhost:4173); usar para probar el HTML pregenerado
```

Si el celular no carga la página, revisa el firewall (`sudo ufw allow 5173/tcp`) y que ambos equipos estén en la misma red
(las redes de invitados suelen aislar dispositivos).

---

## Estructura

```
index.html                   HTML base: meta, SEO, JSON-LD, favicon y script de idioma (ver "Idioma")
vite.config.js               base './' y URLs relativas de recursos (renderBuiltUrl)
scripts/prerender.mjs        inserta el HTML renderizado en dist/index.html (último paso del build)
public/                      favicon.svg y robots.txt (se copian tal cual a dist/)
src/
  main.jsx                   hidrata el HTML pregenerado; en desarrollo monta <App/> desde cero
  entry-server.jsx           renderToString(<App/>) para el prerender
  App.jsx                    idioma, menú activo, pausa de animaciones fuera de pantalla y orden de secciones
  components/
    sections/                una sección por archivo (ver tabla "Secciones")
    HeroNetwork.jsx          canvas de líneas animadas del hero
    RailMap.jsx              mapa interactivo del terreno (Conectividad)
    ui/                      design system HTP: Button, Card, Reveal, Stat, SectionTitle, Input, Select, Dialog, ...
      icons.js               íconos Lucide empaquetados localmente
  data/
    copy.js                  TODOS los textos ES/EN, imágenes de cada bloque y datos de contacto (CONTACT)
    map-copy.js              textos del mapa interactivo
    map-geo.js, rail-paths.js  geometría del mapa
  lib/
    motion.js                reduceMotion(), goTo(id) (scroll a una sección), goToEl(selector) (scroll a un elemento), pad2
    hooks.js                 useReplay(ref): true la primera vez que el elemento entra en pantalla
    serviceRequest.js        "Consultar por este servicio" (Negocios) → preselecciona el servicio en el formulario
  styles/
    index.css                punto de entrada: Tailwind + tokens + secciones (el orden importa)
    tokens/                  colores, tipografía, espaciado, fuentes (@font-face)
    sections/                CSS por sección
  assets/                    fonts/ images/ logos/ masks/ video/ (todos optimizados, ver "Rendimiento")
_export-original/            export original de Claude Design: solo referencia, fuera del build y de git
```

---

## Arquitectura

### Render y prerender

`npm run build` ejecuta tres pasos:

1. `vite build`: bundle del cliente en `dist/`.
2. `vite build --ssr src/entry-server.jsx --outDir dist-ssr`: build para Node.
3. `node scripts/prerender.mjs`: renderiza `<App/>` a HTML, lo inserta en `<div id="root">` de `dist/index.html` y borra `dist-ssr/`.

En el navegador, `main.jsx` usa `hydrateRoot` si `#root` trae contenido y `createRoot` si está vacío (desarrollo).
El contenido aparece antes de que cargue el JavaScript, y los buscadores ven el texto completo.

**Reglas de hidratación (si se rompen, React registra errores y re-renderiza todo):**

- **El primer render no puede depender del navegador.** Nada de `window`, `document`, `localStorage`, `matchMedia`,
  ancho de pantalla ni `prefers-reduced-motion` en el render ni en `useState(...)` iniciales. Usa un estado inicial
  fijo y ajústalo en `useEffect`. Ejemplos: `Hero` (`on`), `Reveal` (`v`), `useReplay`, `Stat` (`n`), `SiteHeader` (`sc`).
- **Lo que depende del ancho de pantalla se resuelve con CSS.** El HTML se genera sin conocer la pantalla.
  Ejemplo: el header renderiza menú de escritorio y hamburguesa, y `header.css` muestra uno u otro.
- **IDs con `useId`**, nunca `Math.random`.
- **`useLayoutEffect` solo en su versión isomórfica**:
  `const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect` (ver `App.jsx`, `tcut.jsx`).
- **Secciones dentro de `<Suspense fallback={null}>`.** Cada sección bajo el hero va envuelta en `App.jsx`, y React las
  hidrata por separado, en tareas cortas. No es carga diferida: el contenido viene completo en el HTML.
- **Recursos importados (imágenes, video)** salen como `./assets/...` en cliente y SSR (`renderBuiltUrl` en
  `vite.config.js`), así que el HTML y la hidratación coinciden y funcionan en subcarpetas.

### Idioma

- `copy.js` exporta `COPY.es` y `COPY.en` con la misma estructura. Toda cadena visible debe existir en ambos.
- El HTML se genera en español. Al cargar, `App` lee `localStorage['htp-landing-lang']` y, si es `en`, cambia de idioma
  dentro de `startTransition` (evita el error #421 de React con secciones aún sin hidratar).
- Para visitantes con inglés guardado, un script en `index.html` agrega `lang-pending` a `<html>`, que oculta `#root` hasta
  que `App` aplica el idioma, con un tope de 4 s. Así no ven un destello del español.
- Al cambiar de idioma, `<main key={lang}>` se vuelve a montar. `changeLang` conserva la posición de scroll y guarda la elección.

### Otros comportamientos globales (`App.jsx`)

- **Menú activo:** IntersectionObserver sobre las secciones de `t.nav` (franja central de la pantalla).
- **Pausa de animaciones:** las secciones (`main section`, `footer`) fuera de pantalla reciben `.anim-off`, que pausa
  todas sus animaciones CSS en bucle (`base.css`). Una sección nueva lo hereda sin hacer nada.
- **Sin `<StrictMode>`:** en desarrollo duplicaría efectos y dispararía animaciones de "primer render".

---

## Secciones

| Orden | `id` | Componente | CSS | Comportamiento clave |
|---|---|---|---|---|
| — | — | `SiteHeader` | `header.css` | Fijo. Transparente sobre el hero y sólido (blanco) al hacer scroll. Escritorio ≥1240 px: menú + "Contactar". Menor: hamburguesa y menú desplegable. Botón de idioma: píldora con fondo glass sobre el hero; <600 px redondo 44×44 con "EN/ES". Alto: 84 → 72 px (sólido); ≤600 px: 64 → 60 px. |
| 1 | `inicio` | `Hero` | `hero.css` | Video (720p celular / 1080p escritorio / MP4 de respaldo) con portada. Empieza a descargarse tras el `load` y se pausa fuera de pantalla. Velo: degradado en ≥1024 px (oscuro a la izquierda) y velo sólido al 75 % en <1024 px. CTA principal → `#formulario`; secundario (frosted) → `#mapa-terreno` (con `goToEl`). |
| 2 | `cifras` | `Stats` | `stats.css` | 6 cifras con contador animado (escribe el texto directamente, sin re-render por cuadro). Cruces animadas en las intersecciones. El brillo giratorio corre solo con hover/foco. Grilla 3 → 2 (≤900) → 1 (≤399). |
| 3 | `negocios` | `Lines` | `lines.css` | Pin de scroll: la sección queda fija y el scroll recorre los 4 servicios. En móvil también se fija si cabe (lista + imagen ≥120 px). Si no cabe (p. ej. teléfono horizontal), rota sola cada 8 s mientras está visible y se detiene al tocar. Swipe en la imagen. Solo descarga la imagen visible y la siguiente. "Consultar por este servicio" → formulario con el servicio preseleccionado. |
| 4 | `carga` | `Cargo` | `cargo.css` | Pestañas (tablist) de tipos de carga y panel con corte "T". ≤960 px: fichas primero y panel debajo; al tocar una ficha se desplaza para mostrar el panel completo. |
| 5 | `conectividad` | `Rail` + `RailMap` | `rail.css` | Lista con barrido naranja al hover/foco. Escritorio: imagen en panel lateral. ≤900 px: acordeón con la imagen bajo la fila. Mapa: puntos, accesos y capas. ≤1100 px: instrucción + mapa a todo el ancho + descripción; capas en un menú "Capas" dentro del mapa; al tocar un elemento, la vista centra el bloque. Puntos 1, 2, 4 y 5 desplazados en ≤560 px para no superponerse. |
| 6 | `futuro` | `Future` | `future.css` | Título + galería fija a pantalla completa bajo el header (`--fp-hdr`, alto en `dvh`). Cada ~100vh de scroll revela la siguiente imagen. Textos anclados abajo; en escritorio la cita va a la derecha. El fondo de `.rf-wrap` pasa de azul a blanco al entrar. |
| 7 | `contacto` | `Contact` | `contact.css` | Datos, mapa de Google (`loading="lazy"`) y formulario con validación (envío **simulado**, ver Pendientes). Formulario en `#formulario`. |
| — | — | `SiteFooter` | `footer.css` | Línea inferior con el degradado de marca. ≤560 px: navegación en 2 columnas. |

Anclas usadas por botones: `#formulario` (Reveal del formulario en `Contact.jsx`) y `#mapa-terreno` (raíz de `RailMap`).

---

## Estilos

### Organización

- `styles/index.css` importa en orden: Tailwind (capas `theme` y `utilities`, **sin preflight**), tokens y secciones.
  **El orden de las secciones replica la cascada original: no lo cambies.**
- El CSS del sitio va fuera de `@layer`, así que siempre gana a Tailwind. Usa utilidades solo en componentes nuevos.
  Para cambiar estilos existentes, edita el CSS de la sección. Utilidades de marca: `bg-azul`, `text-coral`, `border-naranja`,
  `font-corp`, `font-comp`, etc.
- Los efectos usan propiedades finas (`@property --cursor-angle`/`--burst-angle`, máscaras cónicas, `clip-path`): edítalos
  en su archivo, no los migres a Tailwind.
- Los ajustes responsivos posteriores a la migración están **al final de cada archivo de sección**, bajo comentarios
  que explican el porqué. Agrega los nuevos ahí, comentados.
- Varios componentes del design system usan estilos inline (`Button`, `NavLink`, `LanguageToggle`, `SectionTitle`). Para
  sobrescribirlos desde CSS hace falta `!important` (así lo hacen `header.css` y `lines.css`).

### Tokens principales

- **Colores:** `--htp-azul` `#003794`, `--htp-azul-950` `#0A1A3F`, `--htp-azul-900` `#0F2A5C`, `--htp-coral` `#F49368`,
  `--htp-naranja` `#FD6E50`, escala `--htp-azul-50…900` (ver `tokens/colors.css`).
- **Degradados de marca:**
  - `--htp-degradado` (azul → malva → coral): líneas del hero y del footer.
  - `--htp-degradado-cta`: botón principal.
  - Barras de progreso: `linear-gradient(90deg, azul, #8A6A87, coral, naranja)`.
- **Fuentes:** `--font-corporativa` (Montserrat: títulos, UI, mayúsculas) y `--font-complementaria` (TeX Gyre Heros: texto).

### Breakpoints en uso

| Media query | Dónde | Qué cambia |
|---|---|---|
| `min-width:1240px` / `max-width:1239px` | header | menú de escritorio vs. hamburguesa |
| `max-width:1100px` | rail | mapa en una columna; capas dentro del mapa; foco al tocar |
| `min-width:1024px` / `max-width:1023px` | hero, future | degradado vs. velo; layout de textos de la galería |
| `max-width:960px` | cargo, contact, rail | una columna; fichas antes del panel; mapa de Google con alto fijo |
| `max-width:900px` | lines, rail, stats, footer | Negocios en una columna; acordeón de Conectividad; cifras 2 columnas |
| `max-width:600px` / `599px` | header, hero, lines, future | header compacto; botón de idioma redondo; galería a 60 px del borde |
| `max-width:560px` | cargo, contact, rail, stats, footer | fichas compactas; formulario 1 columna; zonas táctiles; puntos del mapa reacomodados |
| `max-width:480px` | hero | CTAs apilados a todo el ancho |
| `max-width:399px` | stats | cifras en 1 columna |
| `(max-height:520px)` + ancho 600–1023 | future | teléfono horizontal: textos en 2 columnas |
| `(pointer:coarse)` | rail | zonas táctiles de 44 px en el mapa |

### Reglas responsivas (aprendidas en este proyecto)

- **Nada puede ensanchar la página.** `main` y `.ft` tienen `overflow-x: clip`. Un desborde horizontal en móvil hace que el
  navegador amplíe la vista y corte el lado derecho de todo el sitio. Los brillos (`.frosted-button-stroke`) sobresalen a
  propósito y quedan recortados.
- **`width: 100%` con borde → `box-sizing: border-box`**, si no el elemento mide 2 px de más.
- **No combinar `aspect-ratio` con `min-height` en contenedores de ancho fluido.** El mínimo de alto se traduce en un
  ancho mínimo y desborda en pantallas de 360 px (pasó con el mapa de Google).
- **Grillas de una columna con `minmax(0,1fr)`**, no `1fr`, para que el contenido largo no las ensanche.
- **Zonas táctiles ≥44 px** (o ampliadas con `::before`). Campos de formulario con `font-size: 16px` en móvil (evita el zoom de iOS).
- **Header fijo:** 72 px (60 px en ≤600) cuando está sólido. Los elementos `sticky` y los scrolls a anclas lo descuentan
  (`goTo`, `goToEl`, `--fp-hdr`, `.ln-pin`).
- **Alto de pantalla en móvil:** `svh` (mínimo) o `dvh` (sigue a la barra del navegador), con `vh` como respaldo.
- **Títulos de sección** (`SectionTitle`): `clamp(24px, 7.5vw, 32px)` para que palabras largas ("INFRAESTRUCTURA") no se corten en 320 px.

---

## Animación y movimiento

- **Aparición al hacer scroll:** `<Reveal>` (fade + desplazamiento de 36 px). Se activa cuando el borde superior cruza el
  88 % de la pantalla (`threshold: 0`, así también funciona con bloques altos). Con `stagger` anima cada hijo en cascada.
- **Scroll vinculado:** Negocios (pin), Visión 2050 (clip-path + parallax) y el fondo de `.rf-wrap`. Usan listeners
  `passive` + `requestAnimationFrame`.
- **`prefers-reduced-motion`:** cada archivo de sección tiene su bloque `@media(prefers-reduced-motion:reduce)`, y en JS se
  usa `reduceMotion()`. Todo componente nuevo con movimiento debe respetarlo.
- **Rendimiento:** anima solo `transform`/`opacity` cuando se pueda. Las animaciones de propiedades `@property` heredables
  (brillos giratorios) recalculan estilos en cada cuadro: limítalas a lo visible (hover, `.anim-off`).

---

## Accesibilidad

- **Contraste WCAG AA verificado sobre los 12 cuadros del video del hero, en 9 anchos.** Si cambias el velo/degradado del hero,
  el video o los colores de su texto, vuelve a medir (ver "Auditoría"). El eyebrow del hero usa `#F9BFA5` (coral aclarado):
  el coral de marca no alcanza 4,5:1 sobre las zonas claras del video.
- **Galería Visión 2050:** degradado inferior denso. El texto blanco queda por sobre 11:1 en todas las imágenes.
- **Patrones existentes:** `role="tablist"` con navegación por flechas (Negocios, Carga), `aria-pressed` en botones de
  alternancia (mapa), `aria-live` en paneles que cambian, `skip-link`, foco visible (`outline` coral).
- **Texto para lectores de pantalla:** clase `.sr-only`. No uses `aria-label` sobre `<span>`/`<div>` sin rol (Lighthouse lo marca).

---

## Rendimiento y recursos

**Presupuesto actual** (no superarlo sin motivo):

| | Celular | Escritorio |
|---|---|---|
| Al abrir la página | ~1,7 MB | ~2,5 MB |
| Recorriendo toda la página | ~3,4 MB | ~4,1 MB |

### Fuentes (`src/assets/fonts/`)

WOFF2 recortadas a latín (ASCII, Latín-1, comillas/guiones tipográficos, `…`, `€`, `™`, flechas, `≤ ≥`), ~25 KB cada una.
Pesos: Montserrat 300/400/500/600/700/800 y TeX Gyre Heros 400/700. El navegador descarga solo los pesos que se usan.
Si un texto nuevo usa caracteres fuera de ese rango, o un peso nuevo, hay que regenerarlas desde los TTF/OTF originales
(están en el historial de git, commit `e86a7ab`, carpeta `src/assets/fonts/`):

```bash
npm i --no-save subset-font
node -e "
const s=require('subset-font'),fs=require('fs');
const text=[...Array(0x7f-0x20)].map((_,i)=>String.fromCharCode(0x20+i)).join('')+'ÁÉÍÓÚáéíóúÑñÜü¿¡«»·—–‘’“”…€™←↑→↓≤≥©';
(async()=>fs.writeFileSync('montserrat-600.woff2', await s(fs.readFileSync('Montserrat-SemiBold.ttf'), text, {targetFormat:'woff2'})))();"
```

Después agrega o actualiza su `@font-face` en `styles/tokens/fonts.css` (con `font-display: swap`).

### Imágenes (`src/assets/images/`)

- Formato WebP, calidad ~74.
  - Fotos de contenido: ancho máximo 1400–1920 px.
  - Si se muestran a menos de ~800 px en móvil, agrega una versión chica (`-800`/`-640`) y úsala con `srcSet` + `sizes`
    (ejemplos en `Lines.jsx` y `Rail.jsx`).
- No subas originales de cámara (5000+ px). Ejemplo de conversión:

```bash
npm i --no-save sharp
node -e "const sh=require('sharp');(async()=>{for(const [w,o] of [[1400,'foto.webp'],[800,'foto-800.webp']]) await sh('original.jpg').resize({width:w,withoutEnlargement:true}).webp({quality:74,effort:6}).toFile(o)})()"
```

- Imágenes bajo el pliegue: `loading="lazy"`. Agrega `width`/`height` si la imagen no está posicionada en absoluto.

### Video del hero (`src/assets/video/`)

Sin audio, 24 fps, bitrate objetivo en dos pasadas y reducción de ruido suave (imperceptible bajo el velo). Para reemplazarlo
partiendo de `original.mp4`:

```bash
VF="fps=24,hqdn3d=1.5:1.5:6:6"
# VP9 1080p (~1,2 Mbps) y 720p (~0,7 Mbps): repetir con scale=-2:720, -b:v 700k y -maxrate 1050k -bufsize 2100k
ffmpeg -y -i original.mp4 -an -vf "$VF,scale=-2:1080" -c:v libvpx-vp9 -b:v 1200k -maxrate 1800k -bufsize 3600k -row-mt 1 -deadline good -cpu-used 2 -g 96 -pass 1 -f null /dev/null
ffmpeg -y -i original.mp4 -an -vf "$VF,scale=-2:1080" -c:v libvpx-vp9 -b:v 1200k -maxrate 1800k -bufsize 3600k -row-mt 1 -deadline good -cpu-used 2 -g 96 -pass 2 hero-1080.webm
# MP4 H.264 720p para iPhone con iOS < 17.4 (no reproducen WebM)
ffmpeg -y -i original.mp4 -an -vf "$VF,scale=-2:720" -c:v libx264 -preset slow -b:v 900k -maxrate 1350k -bufsize 2700k -pass 1 -profile:v high -pix_fmt yuv420p -f mp4 /dev/null
ffmpeg -y -i original.mp4 -an -vf "$VF,scale=-2:720" -c:v libx264 -preset slow -b:v 900k -maxrate 1350k -bufsize 2700k -pass 2 -profile:v high -pix_fmt yuv420p -movflags +faststart hero-720.mp4
# Portada (primer cuadro)
ffmpeg -y -i original.mp4 -frames:v 1 -vf "scale=1280:-2" -c:v libwebp -quality 60 hero-poster.webp
```

Un video nuevo cambia el contraste del texto del hero: vuelve a medirlo.

### Otros

- **Logos SVG:** optimizados con SVGO conservando `viewBox` (`removeViewBox: false`). Máscaras del mapa: PNG de paleta.
- **Mapa de Google (Contacto):** directo con `loading="lazy"`. No se descarga al abrir la página, solo al acercarse
  (~0,5 MB de Google).
- **Canvas del hero:** ~30 fps y arranca tras el `load`.
- **Hosting (pendiente de configurar):** compresión Brotli/gzip y `Cache-Control: max-age=31536000, immutable` para
  `/assets/*` (nombres con hash); `index.html` sin caché larga.

---

## Agregar una sección nueva (checklist)

1. **Textos** en `src/data/copy.js`, en **`es` y `en`** con la misma estructura. Imágenes importadas ahí o en el componente.
2. **Componente** en `src/components/sections/MiSeccion.jsx`:
   - `<section id="mi-id" aria-labelledby="mi-id-t" className="sec">` + `<div className="wrap">` (padding lateral del sitio).
   - Título con `<h2 id="mi-id-t"><SectionTitle light="…" bold="…" size="lg" /></h2>` y `.lead` para la bajada.
   - Apariciones con `<Reveal>`. Íconos con `<Icon name="…">` (registrarlos en `ui/icons.js` si son nuevos).
   - **Reglas de hidratación** (ver "Arquitectura"): nada de `window`/`localStorage`/ancho en el render inicial.
3. **CSS** en `src/styles/sections/mi-seccion.css`, importado en `styles/index.css` en el lugar que le toca. Mobile-first
   o con los breakpoints existentes, más el bloque `prefers-reduced-motion`.
4. **App.jsx:** agrégala en el orden correcto dentro de `<main>`, envuelta en `<Suspense fallback={null}>`.
5. **Menú:** si debe aparecer en la navegación, agrégala a `nav` en `copy.js` (ambos idiomas) con su `id`.
6. **Recursos optimizados** según "Rendimiento".
7. **Auditoría** completa (siguiente sección) y commit.

---

## Auditoría (antes de dar algo por terminado)

1. **Build:** `npm run build` sin advertencias ni errores; termina con
   `prerender: dist/index.html generado con el contenido de la página`.
2. **Sin errores de hidratación:** `npm run preview` y abrir la consola. No debe haber errores (en producción aparecen como
   `Minified React error #418/#421/#423/#425`). Probar también con inglés guardado y con movimiento reducido.
3. **Responsivo:** 320, 360, 375, 414, 768, 1024, 1280, 1440 y 1920 px, y teléfono horizontal (740×360):
   - `document.documentElement.scrollWidth === innerWidth` (sin desborde horizontal) en todo el recorrido;
   - textos legibles (mínimo ~12 px);
   - botones y enlaces con zona táctil de ≥44 px;
   - nada cortado ni superpuesto.
4. **Interacciones en táctil:**
   - menú y anclas;
   - fichas de Carga (scroll al panel);
   - pin de Negocios (01 → 04 con scroll) y swipe;
   - acordeón de Conectividad;
   - todos los puntos y accesos del mapa;
   - menú de capas (se cierra al elegir);
   - centrado del mapa al tocar;
   - galería Visión 2050 (4 imágenes);
   - botones del hero → `#formulario` y `#mapa-terreno`;
   - formulario y cambio de idioma.
5. **Contraste:** si se tocó el hero o la galería, medir el texto sobre los cuadros más claros del video o las imágenes
   (WCAG AA: 4,5:1 texto normal, 3:1 texto grande).
6. **Lighthouse** sobre `npm run preview` (no sobre `dev`):

   ```bash
   npx lighthouse http://localhost:4173/ --only-categories=performance,accessibility,best-practices,seo --view
   npx lighthouse http://localhost:4173/ --preset=desktop --only-categories=performance,accessibility,best-practices,seo --view
   ```

   Objetivo: móvil ≥85, escritorio ≥95, accesibilidad / buenas prácticas / SEO = 100. Con servidor local la nota de
   rendimiento varía ±5 entre corridas: compara varias.
7. **Peso:** revisar en DevTools → Network (con caché deshabilitada) que la carga inicial siga dentro del presupuesto.

---

## Git

- Repositorio local en `main`. `_export-original/` y los `.docx` están fuera de git (material de referencia e interno).
- **Un commit por cambio lógico**, mensaje en español: título breve + cuerpo con el qué y el porqué. Así cada paso se puede
  revertir por separado (`git revert <hash>`), como se hizo con el mapa de Google.
- `core.fileMode=false`: el disco reporta permisos 777 y, sin esto, git marcaría cambios falsos.

---

## Pendientes conocidos

- **Formulario de contacto:** el envío es simulado (`Contact.jsx`, ver el `TODO`). Conectar el backend o el servicio de formularios.
- **Enlaces legales del footer** ("Política de Privacidad", "Canal de Denuncias") apuntan a `#`.
- **Teléfono de contacto** vacío en `CONTACT.phone` (si se completa, aparece automáticamente en Contacto y footer).
- **Hosting:** compresión Brotli y caché larga para `/assets` (ver "Rendimiento").
- **Probar en un iPhone real:** respaldo MP4 del video, `dvh` en la galería y barra del navegador.
- **`sitemap.xml`:** agregar cuando se conozca el dominio definitivo (y referenciarlo en `robots.txt`).

---

## Notas de la migración (origen del proyecto)

El sitio partió como réplica exacta del export de Claude Design (`_export-original/HTP Landing (offline).html`). Se comparó
con capturas automáticas en escritorio y móvil, con y sin animaciones y con interacciones, sin diferencias visibles.
Después se hicieron los ajustes responsivos, de interacción y de rendimiento descritos arriba (ver `git log`).

- **CSS:** se conservó dividido por sección en el orden de la cascada original.
- **Íconos:** vienen de `lucide-static@0.460.0` (fijada) y se empaquetan con el sitio.
- **Versiones fijas:** `react`, `react-dom` y `lucide-static`.
