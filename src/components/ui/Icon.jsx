import { ICONS } from './icons.js';

const cache = {};
function markup(name) {
  if (!(name in cache)) {
    const raw = ICONS[name];
    if (!raw && import.meta.env.DEV) console.warn(`[Icon] "${name}" no está registrado en src/components/ui/icons.js`);
    cache[name] = (raw || '').replace(/<!--[\s\S]*?-->/g, '').replace(/\s(width|height)="[^"]*"/g, '').replace('<svg', '<svg width="100%" height="100%" aria-hidden="true" focusable="false"');
  }
  return cache[name];
}

export function Icon({ name, size = 24, color = 'currentColor', strokeWidth, style, title }) {
  const svg = markup(name);
  const html = svg && strokeWidth ? svg.replace(/stroke-width="[^"]*"/, 'stroke-width="' + strokeWidth + '"') : svg;
  return <span
    role={title ? 'img' : undefined}
    aria-label={title}
    aria-hidden={title ? undefined : true}
    style={{ display: 'inline-flex', flex: 'none', width: size, height: size, color, lineHeight: 0, ...style }}
    dangerouslySetInnerHTML={html ? { __html: html } : undefined}
  />;
}
