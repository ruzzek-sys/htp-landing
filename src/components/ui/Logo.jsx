import logoColor from '../../assets/logos/htp-logo-color.svg';
import logoWhiteDegradado from '../../assets/logos/htp-logo-white-degradado.svg';
import symbolWhite from '../../assets/logos/htp-symbol-white.svg';

const LOGOS = {
  'logo-color': logoColor,
  'logo-white-degradado': logoWhiteDegradado,
  'symbol-white': symbolWhite,
};

export function Logo({ variant = 'color', kind = 'full', height = 48, style, alt = 'Huachipato Terminal Portuario' }) {
  const k = kind === 'symbol' ? 'symbol' : 'logo';
  const v = variant === 'white' ? 'white-degradado' : variant === 'white-mono' ? 'white' : 'color';
  return <img src={LOGOS[k + '-' + v]} alt={alt} style={{ height, width: 'auto', display: 'block', ...style }} />;
}
