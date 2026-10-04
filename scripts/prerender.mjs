// Inserta en dist/index.html el HTML de la página renderizado con React (build SSR en dist-ssr/).
// Se ejecuta con `npm run build`, después de los builds de cliente y SSR.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ssrDir = path.join(root, 'dist-ssr');
const entry = fs.readdirSync(ssrDir).find(f => /^entry-server\.m?js$/.test(f));
const { render } = await import(pathToFileURL(path.join(ssrDir, entry)).href);

const file = path.join(root, 'dist', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const marker = '<div id="root"></div>';
if (!html.includes(marker)) throw new Error('No se encontró ' + marker + ' en dist/index.html');
fs.writeFileSync(file, html.replace(marker, '<div id="root">' + render() + '</div>'));
fs.rmSync(ssrDir, { recursive: true, force: true });
console.log('prerender: dist/index.html generado con el contenido de la página');
