# HTP Landing · Huachipato Terminal Portuario

Landing bilingüe (ES/EN) de HTP. Vite + React 18 + CSS del design system HTP, con Tailwind v4 disponible para desarrollo nuevo.

## Comandos

```bash
npm install
npm run dev       # servidor de desarrollo con HMR (http://localhost:5173)
npm run build     # build de producción en dist/
npm run preview   # sirve dist/ para revisarlo
```

## Estructura

```
index.html                 HTML base: meta, SEO, JSON-LD
src/
  main.jsx                 punto de entrada (monta <App/>)
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
_export-original/          export original de Claude Design (solo referencia, no forma parte del build)
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
