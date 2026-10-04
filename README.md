# HTP Landing · Huachipato Terminal Portuario

Landing bilingüe (ES/EN) de HTP. Vite + React 18 + CSS del design system HTP, con Tailwind v4 disponible para desarrollo nuevo.

## Comandos

```bash
npm install
npm run dev       # servidor de desarrollo con HMR (http://localhost:5173)
npm run build     # build de producción en dist/ (incluye el HTML pregenerado, ver abajo)
npm run preview   # sirve dist/ para revisarlo
```

## Estructura

```
index.html                 HTML base: meta, SEO, JSON-LD
src/
  main.jsx                 punto de entrada: hidrata el HTML pregenerado (o monta <App/> en desarrollo)
  entry-server.jsx         render a HTML usado en el build
  App.jsx                  idioma, menú activo y orden de las secciones
  components/
    sections/              una sección de la landing por archivo
      SiteHeader  Hero  Stats  Lines  Cargo  Rail  Future  Contact  SiteFooter
    HeroNetwork.jsx        canvas animado del hero
    RailMap.jsx            mapa interactivo del terreno
    ui/                    componentes del design system HTP (Button, Icon, Card, Reveal, Stat, ...)
      icons.js             registro de íconos Lucide empaquetados localmente
  data/
    copy.js                todos los textos ES/EN (y las imágenes de cada bloque)
    map-copy.js            textos del mapa
    map-geo.js, rail-paths.js   geometría del mapa
  lib/                     utilidades: scroll a secciones, hooks, comunicación Negocios → Contacto
  styles/
    index.css              punto de entrada: Tailwind + tokens + secciones (en este orden)
    tokens/                tokens del design system (colores, tipografía, espaciado, fuentes)
    sections/              CSS de la landing, un archivo por sección
  assets/                  imágenes, video, logos, máscaras del mapa y fuentes
scripts/prerender.mjs      inserta el HTML renderizado en dist/index.html
public/                    favicon.svg y robots.txt (se copian tal cual a dist/)
_export-original/          export original de Claude Design (solo referencia, no forma parte del build ni de git)
```

## Tareas comunes

- **Editar textos:** `src/data/copy.js` (español en `es`, inglés en `en`). Los del mapa están en `src/data/map-copy.js`.
- **Cambiar una imagen:** reemplaza el archivo en `src/assets/images/` con el mismo nombre, o importa uno nuevo en `copy.js`.
- **Agregar un ícono:** impórtalo desde `lucide-static/icons/<nombre>.svg?raw` en `src/components/ui/icons.js` y agrégalo a `ICONS`.
- **Formulario de contacto:** hoy simula el envío (`Contact.jsx`, ver el `TODO`). Conecta ahí el backend o el servicio de formularios.

## Notas de la migración

El sitio es una réplica exacta del export: se comparó con capturas automáticas contra `_export-original/HTP Landing (offline).html`, en escritorio y móvil, con y sin animaciones y con interacciones, y no hay diferencias visibles.

- **CSS:** se conservó tal cual, dividido por sección en el mismo orden de la cascada original. Los efectos dependen de selectores y propiedades finas (`@property`, máscaras cónicas, `clip-path`), así que conviene editarlos en esos archivos en vez de pasarlos a Tailwind.
- **Tailwind:** se carga **sin preflight**, porque su reset cambiaría el diseño, y dentro de `@layer`. Por eso el CSS del sitio siempre gana sobre las utilidades. Úsalas para componentes nuevos; para sobrescribir estilos existentes, edita el CSS de la sección. Los colores de marca están disponibles como `bg-azul`, `text-coral`, `border-naranja`, `font-corp`, `font-comp`, etc.
- **Íconos:** antes se descargaban de unpkg en tiempo de ejecución. Ahora vienen de `lucide-static@0.460.0` (la misma versión, fijada) y se empaquetan con el sitio.
- **Sin `<StrictMode>`:** en desarrollo ejecuta dos veces los efectos y dispararía animaciones de "primer render" que el original no muestra.
- **Versiones fijas:** `react`, `react-dom` y `lucide-static` están fijadas a las versiones del export.

## HTML pregenerado (prerender)

`npm run build` hace tres pasos: build del cliente, build SSR de `src/entry-server.jsx` y `scripts/prerender.mjs`, que inserta
el HTML de la página en `dist/index.html`. Así el contenido se ve antes de que cargue el JavaScript y React solo lo hidrata.

Reglas para que la hidratación coincida con el HTML generado:

- **El primer render no puede depender del navegador** (`window`, `localStorage`, ancho de pantalla, `prefers-reduced-motion`).
  Usa un estado inicial fijo y ajústalo en un `useEffect`. El idioma se genera en español y se cambia al cargar.
- **Lo que depende del ancho de pantalla se resuelve con CSS**, como el header (menú de escritorio vs. hamburguesa en `header.css`).
- **IDs con `useId`**, nunca con `Math.random`.
- Cada sección bajo el hero va dentro de un `<Suspense>` en `App.jsx` para que la hidratación se reparta en tareas cortas.

## Recursos optimizados

- **Fuentes:** WOFF2 recortadas a caracteres latinos (`src/assets/fonts/`). Si un texto nuevo usa caracteres fuera de ese rango
  (p. ej. otro alfabeto), hay que regenerarlas incluyéndolos.
- **Imágenes:** Negocios y Conectividad tienen dos tamaños (`-800`/`-640`) para `srcset`; las de Visión 2050, máximo 1920 px.
- **Video del hero:** `hero-1080.webm` (escritorio), `hero-720.webm` (celular), `hero-720.mp4` (iPhone con iOS < 17.4) y
  `hero-poster.webp`. Empieza a descargarse cuando la página terminó de cargar y se pausa fuera de pantalla.
- **Mapa de Google:** se carga al tocar la vista previa en Contacto.

