import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Rutas relativas: el build funciona servido desde la raíz o desde una subcarpeta.
  base: './',
  plugins: [react(), tailwindcss()],
});
