import { Icon, Logo } from '../ui';
import { goTo } from '../../lib/motion.js';
import { CONTACT } from '../../data/copy.js';

export function SiteFooter({ t }) {
  const F = t.footer;
  return <footer className="ft" data-on-dark="">
    <div className="wrap ft-grid">
      <div className="ft-brand"><Logo variant="white" height={48} /><p>{F.tag}</p></div>
      <div><p className="ft-h">{F.op}</p><p className="ft-p"><Icon name="map-pin" size={16} color="var(--htp-coral)" />{F.opA}</p><p className="ft-h" style={{ marginTop: 20 }}>{F.corp}</p><p className="ft-p"><Icon name="building-2" size={16} color="var(--htp-coral)" />{F.corpA}</p></div>
      <div><p className="ft-h">{F.contact}</p><p className="ft-p"><Icon name="mail" size={16} color="var(--htp-coral)" /><a href={'mailto:' + CONTACT.email}>{CONTACT.email}</a></p>{CONTACT.phone && <p className="ft-p"><Icon name="phone" size={16} color="var(--htp-coral)" /><a href={'tel:' + CONTACT.phone.replace(/\s/g, '')}>{CONTACT.phone}</a></p>}</div>
      <nav aria-label="Legal" className="ft-nav">{t.nav.map(([id, l]) => <a key={id} href={'#' + id} onClick={e => { e.preventDefault(); goTo(id); }}>{l}</a>)}</nav>
    </div>
    <div className="wrap ft-bot"><span>© 2026 Huachipato Terminal Portuario · {F.rights}</span><span className="ft-legal">{F.legal.map(l => <a key={l} href="#">{l}</a>)}</span></div>
    <div className="ft-bar" aria-hidden="true"></div>
  </footer>;
}
