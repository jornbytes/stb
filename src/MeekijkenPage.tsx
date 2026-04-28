import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { renderBlocks } from './admin/RichEditor';
import {
  ArrowLeft, ArrowRight, Menu, X, CheckCircle, AlertCircle,
  User, Mail, Phone, MessageSquare, Calendar,
} from 'lucide-react';
import { NavIcon, hasNavIcon } from './lib/navIcon';
import AdminTopbar from './admin/AdminTopbar';

type NavItem = {
  id: string;
  label: string;
  href: string;
  open_in_new_tab: boolean;
  icon: string;
};

const FALLBACK_LINKS: NavItem[] = [
  { id: '1', label: 'Speltakken', href: '/#speltakken', open_in_new_tab: false, icon: '' },
  { id: '2', label: 'Over ons',   href: '/#over-ons',   open_in_new_tab: false, icon: '' },
  { id: '3', label: 'Ons gebouw', href: '/#gebouw',     open_in_new_tab: false, icon: '' },
  { id: '4', label: 'Nieuws',     href: '/#nieuws',     open_in_new_tab: false, icon: '' },
  { id: '5', label: 'Contact',    href: '/#contact',    open_in_new_tab: false, icon: '' },
];

type Page = {
  id: string;
  title: string;
  hero_subtitle: string;
  hero_image: string;
  content: string;
  seo_title: string;
};

type FormSettings = {
  badge: string;
  title: string;
  subtitle: string;
  button: string;
  privacyText: string;
  trust: Array<{ title: string; sub: string }>;
  successTitle: string;
  successText: string;
};

const FORM_DEFAULTS: FormSettings = {
  badge: 'Gratis en vrijblijvend',
  title: 'Meld je aan',
  subtitle: 'Vul het formulier in en wij nemen snel contact op om een datum af te spreken.',
  button: 'Aanmelden voor meekijken',
  privacyText: 'Je gegevens worden alleen gebruikt om contact met je op te nemen en worden niet gedeeld.',
  trust: [
    { title: 'Tot 4x gratis', sub: 'probeer zonder verplichtingen' },
    { title: 'Snel reactie', sub: 'we nemen contact op' },
    { title: 'Geen uitrusting', sub: 'kom gewoon zoals je bent' },
  ],
  successTitle: 'Aanmelding ontvangen!',
  successText: 'Bedankt voor je aanmelding. We nemen zo snel mogelijk contact met je op om een datum af te spreken.',
};

const MEEKIJKEN_KEYS = [
  'meekijken_form_badge', 'meekijken_form_title', 'meekijken_form_subtitle',
  'meekijken_form_button', 'meekijken_privacy_text',
  'meekijken_trust_1_title', 'meekijken_trust_1_sub',
  'meekijken_trust_2_title', 'meekijken_trust_2_sub',
  'meekijken_trust_3_title', 'meekijken_trust_3_sub',
  'meekijken_success_title', 'meekijken_success_text',
];

// ─── NavBar ───────────────────────────────────────────────────────────────────

function NavBar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [links, setLinks] = useState<NavItem[]>(FALLBACK_LINKS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    supabase
      .from('nav_items')
      .select('id, label, href, open_in_new_tab, icon')
      .order('position')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setLinks(data.map(l => ({
            ...l,
            icon: l.icon ?? '',
            href: l.href.startsWith('#') ? `/${l.href}` : l.href,
          })));
        }
      });
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
              <a
                key={l.id}
                href={l.href}
                target={l.open_in_new_tab ? '_blank' : undefined}
                rel={l.open_in_new_tab ? 'noopener noreferrer' : undefined}
                className="text-white/80 hover:text-white text-sm font-medium tracking-wide transition-colors"
              >
                {l.label}
              </a>
            )
          ))}
        </nav>
        <a
          href="/meekijken"
          className="group hidden md:flex items-center gap-2 bg-scout-red hover:bg-scout-darkred text-white font-display font-semibold text-sm px-5 py-2.5 rounded-full tracking-wide uppercase transition-colors duration-200"
        >
          Meekijken
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
        </a>
        <button className="md:hidden text-white p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-forest-950 border-t border-forest-800">
          <nav className="flex flex-col px-6 py-4 gap-4">
            {links.map((l) => (
              <a
                key={l.id}
                href={l.href}
                target={l.open_in_new_tab ? '_blank' : undefined}
                rel={l.open_in_new_tab ? 'noopener noreferrer' : undefined}
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white font-medium py-1 transition-colors"
              >
                {l.label}
              </a>
            ))}
            <a
              href="/meekijken"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center gap-2 bg-scout-red text-white font-display font-semibold text-sm px-5 py-3 rounded-full w-fit tracking-wide uppercase"
            >
              Meekijken <ArrowRight className="w-4 h-4" />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

type FooterLink = { id: number; label: string; href: string; link_type: string };

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

// ─── Signup Form ──────────────────────────────────────────────────────────────

type FormState = 'idle' | 'submitting' | 'success' | 'error';

function AanmeldFormulier({ fs }: { fs: FormSettings }) {
  const [naam, setNaam] = useState('');
  const [leeftijd, setLeeftijd] = useState('');
  const [email, setEmail] = useState('');
  const [telefoon, setTelefoon] = useState('');
  const [opmerking, setOpmerking] = useState('');
  const [state, setState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!naam.trim()) e.naam = 'Naam is verplicht';
    if (!leeftijd || isNaN(Number(leeftijd)) || Number(leeftijd) < 4 || Number(leeftijd) > 25)
      e.leeftijd = 'Voer een geldige leeftijd in (4–25)';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = 'Voer een geldig e-mailadres in';
    if (!telefoon.trim()) e.telefoon = 'Telefoonnummer is verplicht';
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setState('submitting');
    const { error } = await supabase.from('meekijken_requests').insert({
      naam: naam.trim(),
      leeftijd: Number(leeftijd),
      email: email.trim(),
      telefoon: telefoon.trim(),
      opmerking: opmerking.trim(),
    });
    setState(error ? 'error' : 'success');
  }

  const inputCls = (field: string) =>
    `w-full bg-white border rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
      errors[field]
        ? 'border-red-300 focus:ring-red-200'
        : 'border-gray-200 focus:ring-forest-300 focus:border-forest-400'
    }`;

  if (state === 'success') {
    return (
      <div className="flex flex-col items-center text-center py-12 gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-display font-bold text-forest-950 text-2xl uppercase">
          {fs.successTitle}
        </h3>
        <p className="text-gray-500 text-sm max-w-sm leading-relaxed">{fs.successText}</p>
        <button
          onClick={() => { setState('idle'); setNaam(''); setLeeftijd(''); setEmail(''); setTelefoon(''); setOpmerking(''); }}
          className="mt-2 text-sm text-forest-700 hover:text-forest-900 font-medium transition-colors"
        >
          Nog een aanmelding doen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {state === 'error' && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Er is iets misgegaan. Probeer het opnieuw of neem contact met ons op.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Naam */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5">
            Naam kind <span className="text-scout-red">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={naam}
              onChange={e => { setNaam(e.target.value); setErrors(p => ({ ...p, naam: '' })); }}
              placeholder="Voor- en achternaam"
              className={inputCls('naam') + ' pl-10'}
            />
          </div>
          {errors.naam && <p className="mt-1 text-xs text-red-500">{errors.naam}</p>}
        </div>

        {/* Leeftijd */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5">
            Leeftijd <span className="text-scout-red">*</span>
          </label>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="number"
              min={4}
              max={25}
              value={leeftijd}
              onChange={e => { setLeeftijd(e.target.value); setErrors(p => ({ ...p, leeftijd: '' })); }}
              placeholder="bijv. 9"
              className={inputCls('leeftijd') + ' pl-10'}
            />
          </div>
          {errors.leeftijd && <p className="mt-1 text-xs text-red-500">{errors.leeftijd}</p>}
        </div>

        {/* Telefoon */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5">
            Telefoonnummer ouder/verzorger <span className="text-scout-red">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="tel"
              value={telefoon}
              onChange={e => { setTelefoon(e.target.value); setErrors(p => ({ ...p, telefoon: '' })); }}
              placeholder="06 12 34 56 78"
              className={inputCls('telefoon') + ' pl-10'}
            />
          </div>
          {errors.telefoon && <p className="mt-1 text-xs text-red-500">{errors.telefoon}</p>}
        </div>

        {/* E-mail */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5">
            E-mailadres ouder/verzorger <span className="text-scout-red">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
              placeholder="naam@email.nl"
              className={inputCls('email') + ' pl-10'}
            />
          </div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>

        {/* Opmerking */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5">
            Opmerking <span className="text-gray-400 font-normal normal-case tracking-normal">(optioneel)</span>
          </label>
          <div className="relative">
            <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <textarea
              rows={3}
              value={opmerking}
              onChange={e => setOpmerking(e.target.value)}
              placeholder="Heb je nog vragen of opmerkingen?"
              className={inputCls('opmerking') + ' pl-10 resize-none'}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={state === 'submitting'}
        className="w-full flex items-center justify-center gap-2 bg-scout-red hover:bg-scout-darkred disabled:opacity-60 disabled:cursor-not-allowed text-white font-display font-semibold text-sm px-6 py-3.5 rounded-xl uppercase tracking-wide transition-colors duration-200"
      >
        {state === 'submitting' ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Versturen...
          </>
        ) : (
          <>
            {fs.button}
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
      <p className="text-center text-xs text-gray-400">{fs.privacyText}</p>
    </form>
  );
}

// ─── MeekijkenPage ────────────────────────────────────────────────────────────

export default function MeekijkenPage() {
  const [page, setPage] = useState<Page | null>(null);
  const [formSettings, setFormSettings] = useState<FormSettings>(FORM_DEFAULTS);

  useEffect(() => {
    supabase
      .from('pages')
      .select('id, title, hero_subtitle, hero_image, content, seo_title')
      .eq('slug', 'meekijken')
      .eq('published', true)
      .maybeSingle()
      .then(({ data }) => setPage(data));

    supabase
      .from('site_settings')
      .select('key, value')
      .in('key', MEEKIJKEN_KEYS)
      .then(({ data }) => {
        if (!data || data.length === 0) return;
        const m: Record<string, string> = {};
        data.forEach(r => { m[r.key] = r.value; });
        setFormSettings({
          badge:        m.meekijken_form_badge    || FORM_DEFAULTS.badge,
          title:        m.meekijken_form_title    || FORM_DEFAULTS.title,
          subtitle:     m.meekijken_form_subtitle || FORM_DEFAULTS.subtitle,
          button:       m.meekijken_form_button   || FORM_DEFAULTS.button,
          privacyText:  m.meekijken_privacy_text  || FORM_DEFAULTS.privacyText,
          successTitle: m.meekijken_success_title || FORM_DEFAULTS.successTitle,
          successText:  m.meekijken_success_text  || FORM_DEFAULTS.successText,
          trust: [
            {
              title: m.meekijken_trust_1_title || FORM_DEFAULTS.trust[0].title,
              sub:   m.meekijken_trust_1_sub   || FORM_DEFAULTS.trust[0].sub,
            },
            {
              title: m.meekijken_trust_2_title || FORM_DEFAULTS.trust[1].title,
              sub:   m.meekijken_trust_2_sub   || FORM_DEFAULTS.trust[1].sub,
            },
            {
              title: m.meekijken_trust_3_title || FORM_DEFAULTS.trust[2].title,
              sub:   m.meekijken_trust_3_sub   || FORM_DEFAULTS.trust[2].sub,
            },
          ],
        });
      });
  }, []);

  const title = page?.title || 'Kom meekijken';
  const fs = formSettings;

  return (
    <div className="min-h-screen bg-white">
      <AdminTopbar pageSlug="meekijken" />
      <title>{page?.seo_title || title}</title>

      <NavBar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative bg-forest-950 overflow-hidden" style={{ minHeight: 440, display: 'flex', flexDirection: 'column' }}>
        {page?.hero_image ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${page.hero_image})`, animation: 'heroZoom 16s ease-out forwards', transform: 'scale(1.06)' }}
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_60%_-10%,rgba(46,101,55,0.45),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_20%_80%,rgba(180,30,30,0.12),transparent)]" />
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/60 via-forest-950/45 to-forest-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(7,26,11,0.6)_100%)]" />
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden opacity-[0.07]">
          <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="xMidYMax slice">
            {[0,130,260,390,520,650,780,910,1040,1170,1300].map((x, i) => (
              <polygon key={i} points={`${x},120 ${x+45},60 ${x+25},72 ${x+45},30 ${x+65},72 ${x+85},60 ${x+90},120`} fill="white" />
            ))}
          </svg>
        </div>
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '200px 200px' }}
        />
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">
          <h1
            className="font-display font-bold text-white uppercase leading-none mb-6"
            style={{ fontSize: 'clamp(2.4rem, 7vw, 5rem)', letterSpacing: '-0.01em', animation: 'fadeSlideUp 0.6s 0.1s ease both' }}
          >
            {title}<span className="text-scout-red">.</span>
          </h1>
          {page?.hero_subtitle && (
            <p
              className="text-white/60 text-base md:text-lg max-w-2xl leading-relaxed font-light"
              style={{ animation: 'fadeSlideUp 0.6s 0.2s ease both' }}
            >
              {page.hero_subtitle}
            </p>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 72" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
            <path d="M0,72 L0,40 C240,72 480,8 720,24 C960,40 1200,72 1440,40 L1440,72 Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* ── Page content ──────────────────────────────────────────────────── */}
      {page && (
        <div className="max-w-3xl mx-auto px-6 py-14">
          {renderBlocks(page.content)}
        </div>
      )}

      {/* ── Aanmeldformulier ──────────────────────────────────────────────── */}
      <div id="aanmelden" className="bg-scout-cream texture-paper py-20 px-6">
        <div className="max-w-2xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-scout-red/10 border border-scout-red/20 text-scout-red font-medium text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-5">
              {fs.badge}
            </div>
            <h2 className="font-display text-forest-950 text-4xl md:text-5xl font-bold uppercase leading-none mb-3">
              {fs.title}<span className="text-scout-red">.</span>
            </h2>
            <p className="text-forest-600 max-w-md mx-auto leading-relaxed text-sm">{fs.subtitle}</p>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-forest-950/5 p-8 md:p-10">
            <AanmeldFormulier fs={fs} />
          </div>

          {/* Trust badges */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {fs.trust.map((b, i) => (
              <div key={i} className="bg-white/60 rounded-xl p-4 border border-gray-100">
                <div className="font-display font-bold text-forest-950 text-sm uppercase tracking-wide leading-tight">{b.title}</div>
                <div className="text-gray-500 text-[11px] mt-1 leading-tight">{b.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-forest-700 hover:text-forest-900 transition group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Terug naar home
        </a>
      </div>

      <Footer />
    </div>
  );
}
