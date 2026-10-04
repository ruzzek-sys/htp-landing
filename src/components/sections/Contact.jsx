import { useEffect, useState } from 'react';
import { Button, Card, Checkbox, Dialog, Icon, Input, Reveal, SectionTitle, Select } from '../ui';
import { onServiceRequest } from '../../lib/serviceRequest.js';
import { CONTACT } from '../../data/copy.js';

const MAP_Q = encodeURIComponent(CONTACT.mapQuery);
const EMPTY = { name: '', company: '', email: '', phone: '', type: '', msg: '', consent: false };

export function Contact({ t }) {
  const C = t.contact; const f = C.f;
  const [v, setV] = useState(EMPTY); const [err, setErr] = useState({}); const [sending, setSending] = useState(false); const [ok, setOk] = useState(false);
  const validate = x => { const e = {}; ['name', 'company', 'email', 'type'].forEach(k => { if (!String(x[k]).trim()) e[k] = f.req; }); if (x.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(x.email)) e.email = f.emailErr; if (!x.consent) e.consent = f.consentErr; return e; };
  const set = k => val => { const nx = { ...v, [k]: val }; setV(nx); if (err[k]) setErr(validate(nx)); };
  const submit = e => {
    e.preventDefault(); const e2 = validate(v); setErr(e2);
    if (Object.keys(e2).length) { const first = ['name', 'company', 'email', 'type', 'consent'].find(k => e2[k]); const el = document.querySelector('[data-f="' + first + '"] input,[data-f="' + first + '"] select,[data-f="' + first + '"] button'); el && el.focus(); return; }
    // TODO: conectar con el backend / servicio de formularios. Por ahora simula el envío.
    setSending(true); setTimeout(() => { setSending(false); setOk(true); setV(EMPTY); }, 1100);
  };
  const n = Object.keys(err).length;
  const svcOpts = [...t.lines.items.map(x => x.k), f.other];
  // "Consultar por este servicio" (sección Negocios) preselecciona el tipo de servicio.
  useEffect(() => onServiceRequest(k => { setV(o => ({ ...o, type: svcOpts[k] })); setErr(o => { const x = { ...o }; delete x.type; return x; }); }), []);
  return <section id="contacto" aria-labelledby="ct-t" className="sec sec-soft">
    <div className="wrap contact">
      <Reveal className="ct-copy">
        <h2 id="ct-t"><SectionTitle light={C.light} bold={C.bold} size="lg" /></h2>
        <p className="lead">{C.lead}</p>
        <ul className="ct-aside">{C.aside.filter(([, , val]) => val).map(([ic, k, val]) => <li key={k}><span className="ct-ic"><Icon name={ic} size={20} strokeWidth={1.6} color="var(--htp-azul)" /></span><span><small>{k}</small>{ic === 'mail' ? <a href={'mailto:' + val}>{val}</a> : ic === 'phone' ? <a href={'tel:' + val.replace(/\s/g, '')}>{val}</a> : val}</span></li>)}</ul>
        <div className="ct-map">
          <p className="ct-map-h">{C.mapT}</p>
          <div className="ct-map-frame"><iframe src={'https://www.google.com/maps?q=' + MAP_Q + '&z=14&output=embed'} title={C.mapT + ' · Huachipato Terminal Portuario'} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen /></div>
          <a className="ct-map-link" href={CONTACT.mapLink} target="_blank" rel="noopener noreferrer">{C.mapOpen}<Icon name="arrow-up-right" size={16} color="currentColor" /></a>
        </div>
      </Reveal>
      <Reveal delay={240} id="formulario">
        <Card variant="elevated" style={{ padding: 0 }}>
          <form noValidate onSubmit={submit} className="ct-form" aria-describedby={n ? 'ct-err' : undefined} style={{ '--rows': (n > 0 ? 'auto ' : '') + 'auto auto auto 1fr auto auto' }}>
            {n > 0 && <p id="ct-err" role="alert" className="ct-err"><Icon name="circle-alert" size={18} color="currentColor" />{f.errSummary}</p>}
            <div data-f="name"><Input label={f.name} required value={v.name} onChange={set('name')} error={err.name} /></div>
            <div data-f="company"><Input label={f.company} required value={v.company} onChange={set('company')} error={err.company} /></div>
            <div data-f="email"><Input label={f.email} type="email" required value={v.email} onChange={set('email')} error={err.email} icon="mail" /></div>
            <div data-f="phone"><Input label={f.phone} type="tel" value={v.phone} onChange={set('phone')} icon="phone" /></div>
            <div data-f="type" className="span2"><Select label={f.type} required placeholder={f.typePh} options={svcOpts} value={v.type} onChange={set('type')} error={err.type} /></div>
            <div className="span2 ct-msg"><Input label={f.msg} multiline rows={4} placeholder={f.msgPh} value={v.msg} onChange={set('msg')} /></div>
            <div data-f="consent" className="span2"><Checkbox label={f.consent} checked={v.consent} onChange={set('consent')} />{err.consent && <p className="ct-ferr" role="alert">{err.consent}</p>}</div>
            <div className="span2 ct-submit"><Button type="submit" size="lg" variant="primary" iconRight={sending ? undefined : 'send'} disabled={sending}>{sending ? f.sending : f.send}</Button></div>
          </form>
        </Card>
      </Reveal>
    </div>
    <Dialog open={ok} title={C.okTitle} onClose={() => setOk(false)} actions={<Button onClick={() => setOk(false)}>{C.close}</Button>}><p style={{ margin: 0 }}>{C.ok}</p></Dialog>
  </section>;
}
