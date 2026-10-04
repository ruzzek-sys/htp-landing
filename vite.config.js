import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Rutas relativas: el build funciona servido desde la raíz o desde una subcarpeta.
  base: './',
  plugins: [react(), tailwindcss()],
  // Las URLs de recursos importados desde JS (imágenes, video) salen como './assets/…' tanto en el cliente como en el
  // render del build (SSR), para que el HTML pregenerado y la hidratación coincidan y funcionen también en subcarpetas.
  experimental: {
    renderBuiltUrl: (filename, { hostType }) => (hostType === 'js' ? './' + filename : { relative: true }),
  },
});
