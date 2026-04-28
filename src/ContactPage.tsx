import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import {
  MapPin, MessageCircle, Calendar, Mail, ArrowRight,
  Menu, X, CheckCircle2, Send, Compass, Clock,
} from 'lucide-react';
import AdminTopbar from './admin/AdminTopbar';
import { NavIcon, hasNavIcon } from './lib/navIcon';

type SiteSettings = Record<string, string>;
type FormField = { key: string; label: string; type: string; placeholder: string; required: boolean };
type NavItem = { id: string; label: string; href: string; open_in_new_tab: boolean };
type FooterLink = { id: number; label: string; href: string; link_type: string };

const FALLBACK_NAV: NavItem[] = [
  { id: '1', label: 'Speltakken', href: '/#speltakken', open_in_new_tab: false },
  { id: '2', label: 'Over ons',   href: '/#over-ons',   open_in_new_tab: false },
  { id: '3', label: 'Ons gebouw', href: '/#gebouw',     open_in_new_tab: false },
  { id: '4', label: 'Nieuws',     href: '/#nieuws',     open_in_new_tab: false },
  { id: '5', label: 'Contact',    href: '/contact',     open_in_new_tab: false },
];

// ─── NavBar ───────────────────────────────────────────────────────────────────

function NavBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [links, setLinks] = useState<NavItem[]>(FALLBACK_NAV);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    supabase.from('nav_items').select('id, label, href, open_in_new_tab, icon').order('position')
      .then(({ data }) => { if (data && data.length > 0) setLinks(data as NavItem[]); });
  }, []);

  return (
    <header
      style={{ top: 'var(--admin-bar-h, 0px)' }}
      className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-forest-950/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16 md:h-20">
        <a href="/" className="flex items-center gap-3 group">
          <img src="/logo-transparant-150.png" alt="Scouting Titus Brandsma" className="h-10 w-auto drop-shadow-md" />
          <div className="leading-tight hidden sm:block">
            <div className="font-display text-white font-semibold text-sm tracking-wide uppercase">Scouting</div>
            <div className="font-display text-scout-red text-xs tracking-wider uppercase">Titus Brandsma</div>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            hasNavIcon(l.icon) ? (
              <a
                key={l.id}
                href={l.href}
                target={l.open_in_new_tab ? '_blank' : undefined}
                rel={l.open_in_new_tab ? 'noopener noreferrer' : undefined}
                className="relative group/navicon text-white/80 hover:text-white transition-colors"
              >
                <NavIcon icon={l.icon} className="w-5 h-5" />
                <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 px-2.5 py-1 rounded-md bg-forest-900 border border-forest-700 text-white text-xs font-medium whitespace-nowrap opacity-0 group-hover/navicon:opacity-100 transition-opacity duration-150 shadow-lg">
                  {l.label}
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-forest-900" />
                </span>
              </a>
            ) : (
              <a key={l.id} href={l.href}
                target={l.open_in_new_tab ? '_blank' : undefined}
                rel={l.open_in_new_tab ? 'noopener noreferrer' : undefined}
                className="text-white/80 hover:text-white text-sm font-medium tracking-wide transition-colors">
                {l.label}
              </a>
            )
          ))}
        </nav>

        <a href="/meekijken"
          className="group hidden md:flex items-center gap-2 bg-scout-red hover:bg-scout-darkred text-white font-display font-semibold text-sm px-5 py-2.5 rounded-full tracking-wide uppercase transition-colors duration-200">
          Meekijken
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
        </a>

        <button className="md:hidden text-white p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-forest-950 border-t border-forest-800">
          <nav className="flex flex-col px-6 py-4 gap-4">
            {links.map((l) => (
              <a key={l.id} href={l.href} onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white font-medium py-1 transition-colors">
                {l.label}
              </a>
            ))}
            <a href="/meekijken" onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center gap-2 bg-scout-red text-white font-display font-semibold text-sm px-5 py-3 rounded-full w-fit tracking-wide uppercase">
              Meekijken <ArrowRight className="w-4 h-4" />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const [footerLinks, setFooterLinks] = useState<FooterLink[]>([]);
  useEffect(() => {
    supabase.from('footer_links').select('id, label, href, link_type').order('position')
      .then(({ data }) => setFooterLinks(data ?? []));
  }, []);

  return (
    <footer className="bg-forest-950">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <img src="/logo-transparant-150.png" alt="Logo" className="h-8 w-auto" />
            <div>
              <div className="text-white font-display font-bold text-sm uppercase tracking-wide leading-tight">Scouting Titus Brandsma</div>
              <div className="text-white/35 text-[11px] tracking-wide">Oldenzaal · Sinds 1945</div>
            </div>
          </div>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            {footerLinks.map((l) => (
              <a key={l.id} href={l.href || '#'}
                target={l.link_type === 'external' && l.href.startsWith('http') ? '_blank' : undefined}
                rel={l.link_type === 'external' && l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="text-white/35 hover:text-white/70 text-xs tracking-wide transition-colors">{l.label}</a>
            ))}
          </div>
          <p className="text-white/20 text-xs">© {new Date().getFullYear()} Alle rechten voorbehouden</p>
        </div>
        <div className="mt-6 pt-5 border-t border-forest-900" />
      </div>
    </footer>
  );
}

// ─── ContactPage ──────────────────────────────────────────────────────────────

export default function ContactPage() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('key, value')
      .then(({ data }) => {
        const map: SiteSettings = {};
        (data ?? []).forEach((r) => { map[r.key] = r.value ?? ''; });
        setSettings(map);
      });
  }, []);

  const title       = settings.contact_title       || 'Contact';
  const subtitle    = settings.contact_subtitle    || 'Heb je een vraag? We staan voor je klaar.';
  const heroImage   = settings.contact_hero_image  || '';
  const intro       = settings.contact_intro       || '';
  const address     = settings.contact_address     || 'Potskampstraat, Oldenzaal';
  const whatsapp    = settings.contact_whatsapp    || '+31 541 363 172';
  const hours       = settings.contact_hours       || 'Wekelijks (tijden per speltak)';
  const email       = settings.contact_email       || '';
  const mapsUrl     = settings.contact_maps_url    || '';
  const formTitle   = settings.contact_form_title  || 'Stuur een bericht';
  const formBtn     = settings.contact_form_button || 'Verstuur bericht';
  const waNumber    = whatsapp.replace(/\D/g, '');

  let fields: FormField[] = [
    { key: 'naam',      label: 'Naam',     type: 'text',     placeholder: 'Jouw naam',                    required: true  },
    { key: 'email',     label: 'E-mail',   type: 'email',    placeholder: 'jouw@email.nl',                required: true  },
    { key: 'onderwerp', label: 'Onderwerp',type: 'text',     placeholder: 'Waar gaat jouw vraag over?',   required: false },
    { key: 'bericht',   label: 'Bericht',  type: 'textarea', placeholder: 'Schrijf hier jouw bericht...', required: true  },
  ];
  try {
    if (settings.contact_form_fields) fields = JSON.parse(settings.contact_form_fields);
  } catch {}

  const contactItems = [
    { icon: <MapPin className="w-5 h-5" />,        label: 'Adres',         value: address,   href: mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(address)}` },
    { icon: <MessageCircle className="w-5 h-5" />, label: 'WhatsApp',      value: whatsapp,  href: `https://wa.me/${waNumber}` },
    { icon: <Clock className="w-5 h-5" />,         label: 'Bijeenkomsten', value: hours,     href: null },
    ...(email ? [{ icon: <Mail className="w-5 h-5" />, label: 'E-mail', value: email, href: `mailto:${email}` }] : []),
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await supabase.from('contact_messages').insert({ fields: formValues });
    setSending(false);
    setSent(true);
  }

  const inputCls = 'w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-scout-red/60 focus:bg-white/8 transition-all';

  return (
    <div className="min-h-screen bg-white">
      <AdminTopbar pageSlug="contact" />
      <title>{title} — Scouting Titus Brandsma</title>
      <NavBar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative bg-forest-950 overflow-hidden" style={{ minHeight: '520px', display: 'flex', flexDirection: 'column' }}>

        {heroImage ? (
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImage})`, animation: 'heroZoom 16s ease-out forwards', transform: 'scale(1.06)' }} />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_90%_at_70%_-5%,rgba(46,101,55,0.5),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_15%_85%,rgba(180,30,30,0.18),transparent)]" />
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/65 via-forest-950/50 to-forest-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(7,26,11,0.65)_100%)]" />

        {/* Compass decoration */}
        <div className="absolute top-32 right-[8%] opacity-[0.04] pointer-events-none hidden lg:block">
          <Compass className="w-64 h-64 text-white" strokeWidth={0.5} />
        </div>

        {/* Pine silhouettes */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden opacity-[0.06]">
          <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="xMidYMax slice">
            {[0,130,260,390,520,650,780,910,1040,1170,1300].map((x, i) => (
              <polygon key={i} points={`${x},120 ${x+45},60 ${x+25},72 ${x+45},30 ${x+65},72 ${x+85},60 ${x+90},120`} fill="white" />
            ))}
          </svg>
        </div>

        {/* Grain */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '200px 200px' }} />

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-32 pb-24">
          <h1 className="font-display font-bold text-white uppercase leading-none mb-5"
            style={{ fontSize: 'clamp(2.8rem, 8vw, 5.5rem)', letterSpacing: '-0.01em', animation: 'fadeSlideUp 0.6s 0.1s ease both' }}>
            {title}<span className="text-scout-red">.</span>
          </h1>
          {subtitle && (
            <p className="text-white/55 text-base md:text-lg max-w-2xl leading-relaxed font-light"
              style={{ animation: 'fadeSlideUp 0.6s 0.2s ease both' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 72" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
            <path d="M0,72 L0,40 C240,72 480,8 720,24 C960,40 1200,72 1440,40 L1440,72 Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-5 gap-16">

          {/* Left col: info */}
          <div className="lg:col-span-2 flex flex-col gap-10">

            {intro && (
              <p className="text-forest-700 leading-relaxed text-base">{intro}</p>
            )}

            {/* Contact info cards */}
            <div className="space-y-4">
              {contactItems.map((item) => {
                const inner = (
                  <div className="flex items-start gap-4 p-4 rounded-2xl border border-forest-100 bg-white hover:border-forest-200 hover:shadow-md transition-all group">
                    <div className="w-11 h-11 rounded-xl bg-forest-950 flex items-center justify-center shrink-0 text-scout-red group-hover:scale-105 transition-transform">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-forest-400 text-[10px] tracking-[0.18em] uppercase font-semibold mb-0.5">{item.label}</div>
                      <div className="text-forest-950 font-medium text-sm leading-snug">{item.value}</div>
                    </div>
                  </div>
                );
                return item.href ? (
                  <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
                ) : (
                  <div key={item.label}>{inner}</div>
                );
              })}
            </div>

            {/* WhatsApp CTA */}
            <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20b858] text-white font-display font-bold text-sm px-7 py-4 rounded-2xl tracking-wide uppercase transition-all shadow-lg shadow-green-900/20 hover:shadow-green-900/30 hover:-translate-y-0.5 w-fit">
              <MessageCircle className="w-5 h-5" />
              App ons op WhatsApp
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* Map */}
            {mapsUrl && (
              <div className="rounded-2xl overflow-hidden border border-forest-100 shadow-sm aspect-video">
                <iframe src={mapsUrl} className="w-full h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Locatie" />
              </div>
            )}
          </div>

          {/* Right col: form */}
          <div className="lg:col-span-3">
            <div className="bg-forest-950 rounded-3xl p-8 md:p-10 shadow-2xl shadow-forest-950/20 border border-forest-900/50 relative overflow-hidden">

              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse_at_top_right,rgba(46,101,55,0.2),transparent)] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[radial-gradient(ellipse_at_bottom_left,rgba(180,30,30,0.08),transparent)] pointer-events-none" />

              <div className="relative z-10">
                {/* Form header */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-scout-red/15 border border-scout-red/20 flex items-center justify-center">
                    <Send className="w-4 h-4 text-scout-red" />
                  </div>
                  <h2 className="font-display font-bold text-white uppercase tracking-wide text-xl">
                    {formTitle}
                  </h2>
                </div>

                {sent ? (
                  <div className="text-center py-16 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <p className="font-display text-white text-xl font-bold uppercase tracking-wide">Verstuurd!</p>
                    <p className="text-white/50 text-sm max-w-xs">We nemen zo snel mogelijk contact met je op.</p>
                    <button onClick={() => setSent(false)}
                      className="mt-4 text-white/40 hover:text-white/70 text-xs tracking-widest uppercase transition-colors">
                      Nieuw bericht sturen
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Render fields in 2-col grid for text/email side by side */}
                    {(() => {
                      const rows: FormField[][] = [];
                      let i = 0;
                      while (i < fields.length) {
                        const f = fields[i];
                        const next = fields[i + 1];
                        if (f.type !== 'textarea' && next && next.type !== 'textarea') {
                          rows.push([f, next]);
                          i += 2;
                        } else {
                          rows.push([f]);
                          i += 1;
                        }
                      }
                      return rows.map((row, ri) => (
                        <div key={ri} className={row.length === 2 ? 'grid grid-cols-1 sm:grid-cols-2 gap-5' : ''}>
                          {row.map((f) => (
                            <div key={f.key}>
                              <label className="block text-white/40 text-[10px] tracking-[0.18em] uppercase font-semibold mb-2">
                                {f.label}{f.required && <span className="text-scout-red ml-0.5">*</span>}
                              </label>
                              {f.type === 'textarea' ? (
                                <textarea rows={5} placeholder={f.placeholder} required={f.required}
                                  value={formValues[f.key] ?? ''}
                                  onChange={(e) => setFormValues(v => ({ ...v, [f.key]: e.target.value }))}
                                  className={inputCls + ' resize-none'} />
                              ) : (
                                <input type={f.type} placeholder={f.placeholder} required={f.required}
                                  value={formValues[f.key] ?? ''}
                                  onChange={(e) => setFormValues(v => ({ ...v, [f.key]: e.target.value }))}
                                  className={inputCls} />
                              )}
                            </div>
                          ))}
                        </div>
                      ));
                    })()}

                    <button type="submit" disabled={sending}
                      className="group w-full flex items-center justify-center gap-2.5 bg-scout-red hover:bg-scout-darkred disabled:opacity-60 text-white font-display font-bold text-sm py-4 rounded-xl tracking-widest uppercase transition-all mt-2">
                      {sending ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      {sending ? 'Versturen...' : formBtn}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
