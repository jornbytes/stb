import { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  ChevronRight,
  MapPin,
  Calendar,
  Shield,
  Tent,
  Star,
  ArrowRight,
  MessageCircle,
  TreePine,
  Heart,
  Compass,
  Users,
  CheckCircle2,
  Play,
  Newspaper,
  Send,
} from 'lucide-react';
import { supabase } from './lib/supabase';
import AdminTopbar from './admin/AdminTopbar';

// ─── Homepage content from DB ────────────────────────────────────────────────

type SiteSettings = Record<string, string>;

function useHomepageContent(): SiteSettings {
  const [s, setS] = useState<SiteSettings>({});
  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .then(({ data }) => {
        const map: SiteSettings = {};
        (data ?? []).forEach((r) => { map[r.key] = r.value ?? ''; });
        setS(map);
      });
  }, []);
  return s;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const speltakken = [
  {
    name: 'Bevers',
    leeftijd: '5 – 7 jaar',
    beschrijving:
      'De allerkleinsten van onze groep. Bevers spelen samen, leren de natuur kennen en maken hun eerste stappen in het scouting-avontuur.',
    accent: 'bg-amber-500',
  },
  {
    name: 'Welpen',
    leeftijd: '7 – 11 jaar',
    beschrijving:
      'Welpen leren samenwerken, knutselen en spelen spannende buitenspellen. Ze groeien als een hecht roedel onder begeleiding van hun leiders.',
    accent: 'bg-forest-600',
  },
  {
    name: 'Scouts',
    leeftijd: '11 – 15 jaar',
    beschrijving:
      'Scouts leren overleven in de natuur, werken aan badges en nemen deel aan nationale en internationale kampen. Avontuur staat centraal.',
    accent: 'bg-scout-red',
  },
  {
    name: 'Verkenners',
    leeftijd: '14 – 17 jaar',
    beschrijving:
      'Verkenners verkennen de wereld op eigen kracht. Ze plannen hun eigen activiteiten en kampen, en nemen verantwoordelijkheid.',
    accent: 'bg-khaki-700',
  },
  {
    name: 'Explorers',
    leeftijd: '17 – 21 jaar',
    beschrijving:
      'Explorers werken aan grote projecten, helpen bij jongere speltakken en bereiden zich voor op een rol als leider.',
    accent: 'bg-forest-700',
  },
  {
    name: 'Stam',
    leeftijd: '21+',
    beschrijving:
      'De Stam vormt het hart van de groep. Volwassen leden ondersteunen de organisatie, begeleiden jongeren en houden de traditie levend.',
    accent: 'bg-forest-900',
  },
];

// ─── Lid Worden Popup ─────────────────────────────────────────────────────────

function LidWordenPopup({ onClose, content }: { onClose: () => void; content: SiteSettings }) {
  const [form, setForm] = useState({
    naam: '',
    email: '',
    telefoon: '',
    geboortedatum: '',
    speltak: '',
    opmerking: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    const { error } = await supabase.from('membership_requests').insert([
      {
        naam: form.naam,
        email: form.email,
        telefoon: form.telefoon,
        geboortedatum: form.geboortedatum || null,
        speltak: form.speltak,
        opmerking: form.opmerking,
      },
    ]);
    if (error) {
      setStatus('error');
    } else {
      setStatus('success');
    }
  };

  const inputCls =
    'w-full bg-forest-800 border border-forest-700 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-scout-red transition-colors';

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 py-6"
    >
      <div className="bg-forest-950 border border-forest-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-forest-800">
          <div className="flex items-center gap-3">
            <img src="/logo-transparant-150.png" alt="Logo" className="h-8 w-auto" />
            <div>
              <div className="font-display text-white font-bold text-lg uppercase tracking-wide">
                Lid worden
              </div>
              <div className="text-white/40 text-xs">Scouting Titus Brandsma</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors p-1"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-forest-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-scout-red" />
            </div>
            <h3 className="font-display text-white text-2xl font-bold uppercase mb-3">
              Aanmelding ontvangen!
            </h3>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Bedankt voor je aanmelding. We nemen zo snel mogelijk contact met je op om alles te
              bespreken. Welkom bij Scouting Titus Brandsma!
            </p>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 bg-scout-red text-white font-display font-semibold text-sm px-6 py-3 rounded-full hover:bg-scout-darkred transition-all tracking-wide uppercase"
            >
              Sluiten
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">
                  Naam *
                </label>
                <input
                  type="text"
                  name="naam"
                  required
                  value={form.naam}
                  onChange={handleChange}
                  placeholder="Volledige naam"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">
                  E-mail *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jouw@email.nl"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">
                  Telefoon
                </label>
                <input
                  type="tel"
                  name="telefoon"
                  value={form.telefoon}
                  onChange={handleChange}
                  placeholder="+31 6 ..."
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">
                  Geboortedatum
                </label>
                <input
                  type="date"
                  name="geboortedatum"
                  value={form.geboortedatum}
                  onChange={handleChange}
                  className={inputCls + ' [color-scheme:dark]'}
                />
              </div>
            </div>

            <div>
              <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">
                Gewenste speltak
              </label>
              <select
                name="speltak"
                value={form.speltak}
                onChange={handleChange}
                className={inputCls}
              >
                <option value="">Kies een speltak (of weet ik nog niet)</option>
                {[0,1,2,3,4,5].map((i) => {
                  const naam = content[`speltak_${i}_naam`] || ['Bevers','Welpen','Scouts','Verkenners','Explorers','Stam'][i];
                  const leeftijd = content[`speltak_${i}_leeftijd`] || ['5–7','7–11','11–15','14–17','17–21','21+'][i];
                  return <option key={i} value={naam}>{naam} ({leeftijd})</option>;
                })}
              </select>
            </div>

            <div>
              <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">
                Opmerkingen
              </label>
              <textarea
                name="opmerking"
                value={form.opmerking}
                onChange={handleChange}
                rows={3}
                placeholder="Heb je nog vragen of wil je iets kwijt?"
                className={inputCls + ' resize-none'}
              />
            </div>

            {status === 'error' && (
              <p className="text-scout-red text-sm text-center">
                Er ging iets mis. Probeer het opnieuw of neem contact op via WhatsApp.
              </p>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-scout-red text-white font-display font-semibold text-sm py-4 rounded-full hover:bg-scout-darkred disabled:opacity-60 transition-all tracking-widest uppercase"
            >
              {status === 'loading' ? 'Versturen...' : 'Aanmelding versturen'}
            </button>

            <p className="text-white/30 text-xs text-center">
              Na je aanmelding nemen we contact met je op voor een kennismaking.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── HeroWord ─────────────────────────────────────────────────────────────────

function HeroWord({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span
      className="block text-4xl md:text-[3.75rem] lg:text-[4.5rem] mb-2"
      style={{ animation: `fadeSlideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both` }}
    >
      {children}
    </span>
  );
}

function CountUp({ target, suffix = '', delay = 0 }: { target: number; suffix?: string; delay?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    // Wait for hero fade-in to complete (~1700ms) then add the per-counter stagger
    const timeout = setTimeout(() => {
      const duration = 1200;
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(ease * target));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 1700 + delay);
    return () => clearTimeout(timeout);
  }, [started, target, delay]);

  return (
    <div ref={ref} className="font-display text-scout-red text-3xl md:text-4xl font-bold tabular-nums">
      {count}{suffix}
    </div>
  );
}

// ─── NavBar ───────────────────────────────────────────────────────────────────

type NavItem = {
  id: string;
  label: string;
  href: string;
  open_in_new_tab: boolean;
};

const FALLBACK_LINKS: NavItem[] = [
  { id: '1', label: 'Speltakken', href: '#speltakken', open_in_new_tab: false },
  { id: '2', label: 'Over ons',   href: '#over-ons',   open_in_new_tab: false },
  { id: '3', label: 'Ons gebouw', href: '#gebouw',     open_in_new_tab: false },
  { id: '4', label: 'Bekijk ons', href: '#video',      open_in_new_tab: false },
  { id: '5', label: 'Nieuws',     href: '#nieuws',     open_in_new_tab: false },
  { id: '6', label: 'Contact',    href: '#contact',    open_in_new_tab: false },
];

function NavBar({ onLidWorden }: { onLidWorden: () => void }) {
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
      .select('id, label, href, open_in_new_tab')
      .order('position')
      .then(({ data }) => {
        if (data && data.length > 0) setLinks(data);
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
        <a href="#" className="flex items-center gap-3 group">
          <img
            src="/logo-transparant-150.png"
            alt="Scouting Titus Brandsma"
            className="h-10 w-auto drop-shadow-md"
          />
          <div className="leading-tight hidden sm:block">
            <div className="font-display text-white font-semibold text-sm tracking-wide uppercase">
              Scouting
            </div>
            <div className="font-display text-scout-red text-xs tracking-wider uppercase">
              Titus Brandsma
            </div>
          </div>
        </a>

        <nav className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <a
              key={l.id}
              href={l.href}
              target={l.open_in_new_tab ? '_blank' : undefined}
              rel={l.open_in_new_tab ? 'noopener noreferrer' : undefined}
              className="text-white/80 hover:text-white text-sm font-medium tracking-wide transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <button
          onClick={onLidWorden}
          className="group hidden md:flex items-center gap-2 bg-scout-red hover:bg-scout-darkred text-white font-display font-semibold text-sm px-5 py-2.5 rounded-full tracking-wide uppercase transition-colors duration-200"
        >
          Lid worden
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
        </button>

        <button
          className="md:hidden text-white p-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
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
            <button
              onClick={() => { setOpen(false); onLidWorden(); }}
              className="mt-2 inline-flex items-center gap-2 bg-scout-red text-white font-display font-semibold text-sm px-5 py-3 rounded-full w-fit tracking-wide uppercase"
            >
              Lid worden <ArrowRight className="w-4 h-4" />
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ onLidWorden, content }: { onLidWorden: () => void; content: SiteSettings }) {
  const bgImage = content.hero_bg_image || 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1920&q=80';
  const title1 = content.hero_title_1 || 'Avontuur';
  const title2 = content.hero_title_2 || 'Vriendschap';
  const title3 = content.hero_title_3 || 'Groei';
  const subtitle = content.hero_subtitle || 'Scouting Titus Brandsma is al meer dan 70 jaar de plek waar kinderen en jongeren uit Oldenzaal vrienden maken, de natuur ontdekken en zichzelf ontwikkelen.';
  const stats = [
    { value: content.hero_stat_1_value || '70+', label: content.hero_stat_1_label || 'Jaar actief', delay: 200 },
    { value: content.hero_stat_2_value || '40+', label: content.hero_stat_2_label || 'Vrijwilligers', delay: 400 },
    { value: content.hero_stat_3_value || '8',   label: content.hero_stat_3_label || 'Speltakken',   delay: 600 },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-forest-950">
      {/* Background photo — brighter so the scene is visible */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 scale-105"
        style={{
          backgroundImage: `url(${bgImage})`,
          animation: 'heroZoom 12s ease-out forwards',
        }}
      />
      {/* Gradient: lighter top, fade-out toward bottom edge only */}
      <div className="absolute inset-0 bg-gradient-to-b from-forest-950/70 via-forest-950/50 to-forest-950/90" />
      {/* Subtle vignette sides */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(7,26,11,0.6)_100%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32 text-center">
        {/* Logo */}
        <div
          className="flex justify-center mb-6 animate-pop-in"
          style={{ animationDelay: '0.05s' }}
        >
          <img
            src="/logo-transparant-150.png"
            alt="Scouting Titus Brandsma"
            className="h-20 md:h-24 w-auto drop-shadow-2xl"
          />
        </div>

        <h1 className="font-display font-bold text-white uppercase mb-6 tracking-tight">
          <HeroWord delay={0.15}>{title1}<span className="text-scout-red ml-1">.</span></HeroWord>
          <HeroWord delay={0.28}><span className="text-scout-red">{title2}</span><span className="text-white ml-1">.</span></HeroWord>
          <HeroWord delay={0.41}>{title3}<span className="text-scout-red ml-1">.</span></HeroWord>
        </h1>

        <p
          className="text-white/75 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light animate-fade-in-up"
          style={{ animationDelay: '0.6s' }}
        >
          {subtitle}
        </p>

        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up"
          style={{ animationDelay: '0.75s' }}
        >
          <button
            onClick={onLidWorden}
            className="group inline-flex items-center gap-2 bg-scout-red hover:bg-scout-darkred text-white font-display font-semibold text-sm px-8 py-4 rounded-full tracking-widest uppercase transition-colors duration-200 shadow-lg shadow-scout-red/30"
          >
            Lid worden
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
          </button>
          <a
            href="#speltakken"
            className="group inline-flex items-center gap-2 border border-white/40 hover:border-white/80 bg-white/5 hover:bg-white/10 text-white font-display text-sm px-8 py-4 rounded-full tracking-widest uppercase transition-all duration-200"
          >
            Meer over ons
          </a>
        </div>

        <div
          className="mt-14 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fade-in-up"
          style={{ animationDelay: '0.9s' }}
        >
          {stats.map((s) => {
            const numMatch = s.value.match(/\d+/);
            const target = numMatch ? parseInt(numMatch[0]) : 0;
            const suffix = s.value.replace(/\d+/, '');
            return (
              <div key={s.label} className="text-center">
                <CountUp target={target} suffix={suffix} delay={s.delay} />
                <div className="text-white/50 text-xs tracking-wide mt-1">{s.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#speltakken"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors duration-200"
        aria-label="Scroll naar beneden"
      >
        <span className="text-[10px] tracking-[0.25em] uppercase font-display">Ontdek meer</span>
        <div className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center pt-1.5">
          <div className="w-1 h-1.5 bg-white/60 rounded-full" style={{ animation: 'scrollDot 1.8s ease-in-out infinite' }} />
        </div>
      </a>
    </section>
  );
}

// ─── Section Dividers ────────────────────────────────────────────────────────
// Standalone dividers rendered between sections to avoid sub-pixel white lines.

function DividerCreamToDark() {
  return (
    <div style={{ display: 'block', lineHeight: 0, backgroundColor: '#faf8f0', marginBottom: -1 }}>
      <svg viewBox="0 0 1440 64" style={{ display: 'block', width: '100%' }} preserveAspectRatio="none">
        <path
          d="M0,64 L0,38 C60,38 80,12 120,12 C160,12 175,42 220,42 C265,42 282,14 328,14 C374,14 388,44 432,44 C476,44 490,16 536,16 C582,16 596,46 640,46 C684,46 698,10 744,10 C790,10 804,42 848,42 C892,42 908,16 952,16 C996,16 1012,46 1056,46 C1100,46 1116,18 1160,18 C1204,18 1220,48 1264,48 C1308,48 1322,14 1368,14 C1404,14 1426,36 1440,36 L1440,64 Z"
          fill="#071a0b"
        />
      </svg>
    </div>
  );
}

function DividerDarkToCream() {
  return (
    <div style={{ display: 'block', lineHeight: 0, backgroundColor: '#071a0b', marginBottom: -1 }}>
      <svg viewBox="0 0 1440 64" style={{ display: 'block', width: '100%' }} preserveAspectRatio="none">
        <path
          d="M0,64 L0,36 C50,36 68,8 110,8 C152,8 168,40 212,40 C256,40 272,12 316,12 C360,12 376,44 420,44 C464,44 478,18 524,18 C570,18 584,50 628,50 C672,50 688,14 732,14 C776,14 792,46 836,46 C880,46 896,20 940,20 C984,20 1000,50 1044,50 C1088,50 1104,22 1148,22 C1192,22 1208,48 1252,48 C1296,48 1312,16 1356,16 C1396,16 1420,38 1440,38 L1440,64 Z"
          fill="#faf8f0"
        />
      </svg>
    </div>
  );
}

// ─── Campfire SVG ─────────────────────────────────────────────────────────────

function Campfire({ size = 200 }: { size?: number }) {
  return (
    <svg width={size} height={size * 0.85} viewBox="0 0 200 170" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ground glow */}
      <ellipse cx="100" cy="148" rx="52" ry="10" fill="#ff6b00" className="glow" opacity="0.35" />

      {/* Logs */}
      <g className="log-glow">
        <rect x="52" y="138" width="80" height="12" rx="6" fill="#5c3317" transform="rotate(-8 52 138)" />
        <rect x="68" y="136" width="80" height="12" rx="6" fill="#7a4520" transform="rotate(8 68 136)" />
        <ellipse cx="73" cy="149" rx="7" ry="5" fill="#3d2008" />
        <ellipse cx="127" cy="149" rx="7" ry="5" fill="#3d2008" />
      </g>

      {/* Coals */}
      <ellipse cx="100" cy="147" rx="26" ry="7" fill="#ff4500" opacity="0.6" className="glow" />
      <circle cx="90" cy="146" r="3" fill="#ff8c00" opacity="0.9" />
      <circle cx="105" cy="147" r="2.5" fill="#ffaa00" opacity="0.9" />
      <circle cx="115" cy="145" r="2" fill="#ff6600" opacity="0.8" />

      {/* Outer flame — wide base */}
      <g className="flame-2">
        <path d="M72 140 C68 120 62 105 74 88 C80 80 76 65 85 55 C88 68 82 78 88 92 C92 102 90 115 86 130 Z"
          fill="#ff4500" opacity="0.7" />
      </g>
      <g className="flame-2" style={{ animationDelay: '0.3s' }}>
        <path d="M128 140 C132 120 138 105 126 88 C120 80 124 65 115 55 C112 68 118 78 112 92 C108 102 110 115 114 130 Z"
          fill="#ff4500" opacity="0.7" />
      </g>

      {/* Mid flame */}
      <g className="flame-1">
        <path d="M80 140 C75 118 70 100 80 82 C86 70 83 52 92 38 C96 55 90 70 96 85 C100 97 98 118 94 138 Z"
          fill="#ff6b00" opacity="0.9" />
      </g>
      <g className="flame-1" style={{ animationDelay: '0.2s' }}>
        <path d="M120 140 C125 118 130 100 120 82 C114 70 117 52 108 38 C104 55 110 70 104 85 C100 97 102 118 106 138 Z"
          fill="#ff6b00" opacity="0.9" />
      </g>

      {/* Core flame — tallest */}
      <g className="flame-3">
        <path d="M88 138 C84 115 80 95 88 72 C92 58 90 38 100 22 C110 38 108 58 112 72 C120 95 116 115 112 138 Z"
          fill="#ffb300" opacity="0.95" />
      </g>

      {/* Bright inner core */}
      <g className="flame-1" style={{ animationDelay: '0.1s' }}>
        <path d="M94 136 C91 118 90 100 96 82 C99 72 98 55 100 42 C102 55 101 72 104 82 C110 100 109 118 106 136 Z"
          fill="#fff176" opacity="0.8" />
      </g>

      {/* Embers */}
      {[
        { cx: 88, cy: 130, r: 1.5, delay: '0s',   dur: '2.2s' },
        { cx: 112, cy: 128, r: 1.2, delay: '0.6s', dur: '1.8s' },
        { cx: 96, cy: 135,  r: 1.0, delay: '1.1s', dur: '2.5s' },
        { cx: 105, cy: 132, r: 1.3, delay: '0.3s', dur: '2.0s' },
        { cx: 93, cy: 138,  r: 0.9, delay: '1.5s', dur: '1.6s' },
      ].map((e, i) => (
        <circle
          key={i}
          cx={e.cx} cy={e.cy} r={e.r}
          fill="#ffdd00"
          className="ember"
          style={{ animationDelay: e.delay, animationDuration: e.dur }}
        />
      ))}
    </svg>
  );
}

// ─── Speltakken ───────────────────────────────────────────────────────────────

const speltakTilts = [-2, 1.5, -1, 2, -1.5, 1];
const speltakColors = [
  { bg: 'bg-amber-50',   border: 'border-amber-200',   accent: 'bg-amber-500',   tag: 'bg-amber-100 text-amber-800' },
  { bg: 'bg-forest-50',  border: 'border-forest-200',  accent: 'bg-forest-600',  tag: 'bg-forest-100 text-forest-800' },
  { bg: 'bg-red-50',     border: 'border-red-200',     accent: 'bg-scout-red',   tag: 'bg-red-100 text-red-800' },
  { bg: 'bg-khaki-50',   border: 'border-khaki-200',   accent: 'bg-khaki-700',   tag: 'bg-khaki-100 text-khaki-800' },
  { bg: 'bg-forest-50',  border: 'border-forest-300',  accent: 'bg-forest-700',  tag: 'bg-forest-100 text-forest-900' },
  { bg: 'bg-stone-50',   border: 'border-stone-200',   accent: 'bg-forest-900',  tag: 'bg-stone-100 text-stone-700' },
];

function Speltakken({ content }: { content: SiteSettings }) {
  const defaultSpeltakken = [
    { naam: 'Bevers',     leeftijd: '5 – 7 jaar',   beschrijving: 'De allerkleinsten van onze groep. Bevers spelen samen, leren de natuur kennen en maken hun eerste stappen in het scouting-avontuur.' },
    { naam: 'Welpen',     leeftijd: '7 – 11 jaar',  beschrijving: 'Welpen leren samenwerken, knutselen en spelen spannende buitenspellen. Ze groeien als een hecht roedel onder begeleiding van hun leiders.' },
    { naam: 'Scouts',     leeftijd: '11 – 15 jaar', beschrijving: 'Scouts leren overleven in de natuur, werken aan badges en nemen deel aan nationale en internationale kampen. Avontuur staat centraal.' },
    { naam: 'Verkenners', leeftijd: '14 – 17 jaar', beschrijving: 'Verkenners verkennen de wereld op eigen kracht. Ze plannen hun eigen activiteiten en kampen, en nemen verantwoordelijkheid.' },
    { naam: 'Explorers',  leeftijd: '17 – 21 jaar', beschrijving: 'Explorers werken aan grote projecten, helpen bij jongere speltakken en bereiden zich voor op een rol als leider.' },
    { naam: 'Stam',       leeftijd: '21+',           beschrijving: 'De Stam vormt het hart van de groep. Volwassen leden ondersteunen de organisatie, begeleiden jongeren en houden de traditie levend.' },
  ];

  const cards = defaultSpeltakken.map((d, i) => ({
    naam:         content[`speltak_${i}_naam`]         || d.naam,
    leeftijd:     content[`speltak_${i}_leeftijd`]     || d.leeftijd,
    beschrijving: content[`speltak_${i}_beschrijving`] || d.beschrijving,
    href:         content[`speltak_${i}_href`]         || '',
  }));

  return (
    <section id="speltakken" className="relative bg-scout-cream texture-paper overflow-hidden py-24 px-6">
      {/* Background pine silhouette */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.035]">
        <svg viewBox="0 0 1440 600" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
          {[0, 200, 400, 600, 800, 1000, 1200, 1440].map((x, i) => (
            <polygon key={i} points={`${x},600 ${x+70},350 ${x+40},380 ${x+70},280 ${x+50},310 ${x+70},180 ${x+140},600`} fill="#1e5226" />
          ))}
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-scout-red/10 border border-scout-red/20 text-scout-red font-medium text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-5">
            <Tent className="w-3.5 h-3.5" /> Onze groepen
          </div>
          <h2 className="font-display text-forest-950 text-5xl md:text-6xl font-bold uppercase leading-none mb-4">
            Vind jouw<br /><span className="text-scout-red italic">speltak</span>
          </h2>
          <p className="text-forest-600 max-w-md mx-auto leading-relaxed">
            Van de jongste Bevers tot de ervaren Stam: voor elke leeftijd een eigen avontuur.
          </p>
        </div>

        {/* Cards grid — alternating tilts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {cards.map((s, i) => {
            const c = speltakColors[i];
            const tilt = speltakTilts[i];
            const inner = (
              <div
                className={`group relative ${c.bg} ${c.border} border-2 rounded-2xl overflow-hidden
                  shadow-md hover:shadow-2xl transition-all duration-300 ${s.href ? 'cursor-pointer' : 'cursor-default'}`}
                style={{ transform: `rotate(${tilt}deg)`, transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'rotate(0deg) translateY(-8px) scale(1.02)')}
                onMouseLeave={e => (e.currentTarget.style.transform = `rotate(${tilt}deg)`)}
              >
                <div className={`${c.accent} h-3`} />
                <div className={`absolute top-5 right-4 ${c.tag} text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full`}>
                  {s.leeftijd}
                </div>
                <div className="p-7 pt-5">
                  <h3 className="font-display text-forest-950 text-3xl font-bold uppercase mb-3 leading-none">{s.naam}</h3>
                  <p className="text-forest-600 text-sm leading-relaxed mb-5">{s.beschrijving}</p>
                  <span className="flex items-center gap-1.5 text-scout-red font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                    Meer weten <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 rounded-b-2xl" />
              </div>
            );
            return s.href ? (
              <a key={i} href={s.href}>{inner}</a>
            ) : (
              <div key={i}>{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Over Ons ─────────────────────────────────────────────────────────────────

function OverOns({ content }: { content: SiteSettings }) {
  const title = content.over_ons_title || 'Al meer dan 70 jaar avontuur';
  const text1 = content.over_ons_text_1 || 'Scouting Titus Brandsma is een scoutinggroep in het hart van Oldenzaal. Met ruim 40 actieve vrijwilligers bieden wij elke week inspirerende activiteiten voor kinderen en jongeren van 5 tot 21 jaar en ouder.';
  const text2 = content.over_ons_text_2 || 'Onze roots gaan terug tot vlak na de Tweede Wereldoorlog. Door de jaren heen groeide onze groep uit tot de hechte scoutingfamilie die we vandaag de dag zijn.';
  const photo = content.over_ons_photo || '/jubileum_groepsfoto.jpg';
  return (
    <section id="over-ons" className="relative bg-forest-950 texture-wood overflow-hidden pt-10 pb-0 px-6">

      {/* Subtle star field */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {[
          [120,40],[340,80],[580,30],[820,60],[1100,25],[1300,70],[200,120],[700,100],[950,45],[1200,110],
          [60,160],[450,140],[870,155],[1380,130],[310,200],[670,180],[1050,190],[1320,210],
        ].map(([x,y],i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: x, top: y,
              width: i % 3 === 0 ? 2 : 1.5,
              height: i % 3 === 0 ? 2 : 1.5,
              opacity: 0.15 + (i % 4) * 0.07,
              animation: `glowPulse ${1.5 + (i % 5) * 0.4}s ease-in-out infinite`,
              animationDelay: `${(i * 0.27) % 3}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Top: campfire hero row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pb-20 pt-14">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-6">
              Over ons
            </div>
            <h2 className="font-display text-white text-5xl md:text-6xl font-bold uppercase leading-[1.05] mb-8">
              {title}
            </h2>
            <p className="text-white/70 leading-relaxed mb-5">
              {text1}
            </p>
            <p className="text-white/60 leading-relaxed mb-10 text-sm">
              {text2}
            </p>

            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <Users className="w-5 h-5" />, title: 'Gemeenschap', text: 'Vriendschappen voor het leven.' },
                { icon: <TreePine className="w-5 h-5" />, title: 'Natuur', text: 'De natuur is onze tweede thuis.' },
                { icon: <Heart className="w-5 h-5" />, title: 'Vrijwilligers', text: 'Elke week klaar voor de jeugd.' },
              ].map((v) => (
                <div key={v.title} className="bg-forest-900/80 backdrop-blur rounded-xl p-4 border border-forest-800 hover:border-orange-500/30 hover:bg-forest-900 transition-all group">
                  <div className="text-orange-400 mb-2.5 group-hover:scale-110 transition-transform">{v.icon}</div>
                  <div className="font-display text-white font-semibold text-xs uppercase tracking-wide mb-1.5">{v.title}</div>
                  <p className="text-white/40 text-[11px] leading-relaxed">{v.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Campfire + photo stack */}
          <div className="relative flex flex-col items-center">
            {/* Photo */}
            <div className="relative w-full">
              <div
                className="rounded-2xl overflow-hidden aspect-[4/5] shadow-2xl border-4 border-forest-800"
                style={{ transform: 'rotate(1.5deg)' }}
              >
                <img
                  src={photo}
                  alt="Scouting Titus Brandsma groepsfoto"
                  className="w-full h-full object-cover object-top"
                />
                {/* Orange campfire glow overlay at bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-900/40 to-transparent" />
              </div>

              {/* Campfire sitting at bottom of photo */}
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 z-20 drop-shadow-2xl">
                <Campfire size={160} />
              </div>

              {/* Glow beneath campfire */}
              <div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-12 rounded-full glow pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(255,107,0,0.35) 0%, transparent 70%)' }}
              />
            </div>

            {/* 70 jaar stamp */}
            <div
              className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-scout-red border-4 border-scout-darkred
                flex flex-col items-center justify-center shadow-2xl badge-wobble z-30"
            >
              <span className="font-display text-white text-2xl font-bold leading-none">70</span>
              <span className="font-display text-white/80 text-[8px] uppercase tracking-widest leading-none">jaar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campfire glow on section floor */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-48 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(255,107,0,0.12) 0%, transparent 70%)' }}
      />

    </section>
  );
}

// ─── Video ────────────────────────────────────────────────────────────────────

function VideoSection({ content }: { content: SiteSettings }) {
  const [playing, setPlaying] = useState(false);
  const ytId = content.video_youtube_id || '7jhFlcPjLTU';

  return (
    <section id="video" className="relative bg-scout-cream texture-paper overflow-hidden py-24 px-6">
      {/* Background compass rose watermark */}
      <div className="absolute right-10 top-10 opacity-[0.04] pointer-events-none select-none">
        <Compass className="w-72 h-72 text-forest-950" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header — centered */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-scout-red/10 border border-scout-red/20 text-scout-red font-medium text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-5">
            Bekijk ons
          </div>
          <h2 className="font-display text-forest-950 text-5xl md:text-6xl font-bold uppercase leading-none mb-4">
            Scouting <span className="text-scout-red italic">in actie</span>
          </h2>
          <p className="text-forest-600 max-w-md mx-auto leading-relaxed">
            Wil je zien wat scouting echt inhoudt? Avontuur, vriendschap en groei. Dit ben wij.
          </p>
        </div>

        {/* Video — tilted frame */}
        <div className="max-w-4xl mx-auto" style={{ transform: 'rotate(-0.8deg)' }}>
          <div className="relative rounded-2xl overflow-hidden shadow-[0_25px_60px_-10px_rgba(0,0,0,0.35)] aspect-video bg-forest-950 group border-4 border-white">
            {!playing ? (
              <>
                <img
                  src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
                  alt="Scouting video"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                  }}
                />
                <div className="absolute inset-0 bg-forest-950/50 group-hover:bg-forest-950/35 transition-colors duration-300" />
                <button
                  onClick={() => setPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center"
                  aria-label="Video afspelen"
                >
                  <div className="relative">
                    {/* Pulsing ring */}
                    <div className="absolute inset-0 rounded-full bg-scout-red/30 animate-ping" />
                    <div className="w-24 h-24 bg-scout-red rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 relative z-10">
                      <Play className="w-9 h-9 text-white fill-white ml-1.5" />
                    </div>
                  </div>
                </button>
                <div className="absolute bottom-6 left-6">
                  <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
                    <Tent className="w-4 h-4 text-scout-red" />
                    Scouting Titus Brandsma · Oldenzaal
                  </div>
                </div>
              </>
            ) : (
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&playsinline=1`}
                title="Scouting Titus Brandsma"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            )}
          </div>
          {/* Shadow tape pieces */}
          <div className="absolute -top-3 left-16 w-20 h-5 bg-khaki-200/60 rotate-3 rounded-sm" />
          <div className="absolute -top-3 right-16 w-20 h-5 bg-khaki-200/60 -rotate-2 rounded-sm" />
        </div>
      </div>

    </section>
  );
}

// ─── Gebouw ───────────────────────────────────────────────────────────────────

function Gebouw({ content }: { content: SiteSettings }) {
  const title = content.gebouw_title || 'Thuis in Oldenzaal';
  const text = content.gebouw_text || 'Ons clubhuis aan de Potskampstraat is het kloppende hart van de groep: meerdere ruimtes, een volwaardige keuken en een groot buitenterrein vol avontuur.';
  const photo = content.gebouw_photo || 'https://www.scoutingtitusbrandsma.nl/wp-content/uploads/2020/07/buiten1.jpg';
  return (
    <section id="gebouw" className="relative bg-forest-950 texture-wood overflow-hidden py-24 px-6">
      {/* Background map grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#4ade80 1px, transparent 1px), linear-gradient(90deg, #4ade80 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <div className="relative order-2 lg:order-1">
            {/* Photo frame — slightly tilted */}
            <div
              className="rounded-2xl overflow-hidden shadow-2xl border-4 border-forest-800"
              style={{ transform: 'rotate(-1.5deg)' }}
            >
              <img
                src={photo}
                alt="Scouting Titus Brandsma buiten activiteiten"
                className="w-full h-full object-cover aspect-[4/3]"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/30 to-transparent" />
            </div>

            {/* Tape corners */}
            <div className="absolute -top-3 -left-3 w-14 h-6 bg-khaki-300/40 rotate-45 rounded-sm" />
            <div className="absolute -bottom-3 -right-3 w-14 h-6 bg-khaki-300/40 rotate-45 rounded-sm" />

            {/* Location badge */}
            <div className="absolute -top-5 -right-5 bg-scout-red rounded-xl p-5 shadow-2xl"
              style={{ transform: 'rotate(3deg)' }}>
              <MapPin className="w-6 h-6 text-white mb-1.5" />
              <div className="text-white font-display font-bold text-sm uppercase tracking-wide leading-none">
                Potskamp
              </div>
              <div className="text-white/70 text-[10px] tracking-wider uppercase mt-0.5">Oldenzaal</div>
            </div>

          </div>

          {/* Text side */}
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 bg-scout-red/10 border border-scout-red/20 text-scout-red font-medium text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-6">
              Ons gebouw
            </div>
            <h2 className="font-display text-white text-5xl md:text-6xl font-bold uppercase leading-[1.05] mb-8">
              {title}
            </h2>
            <p className="text-white/70 leading-relaxed mb-5">
              {text}
            </p>

            <ul className="space-y-3 mb-10">
              {[
                { label: 'Meerdere activiteitenruimtes', icon: <Shield className="w-3.5 h-3.5" /> },
                { label: 'Volwaardige keuken',           icon: <Star className="w-3.5 h-3.5" /> },
                { label: 'Groot buitenterrein',           icon: <TreePine className="w-3.5 h-3.5" /> },
                { label: 'Centrale locatie in Oldenzaal', icon: <MapPin className="w-3.5 h-3.5" /> },
              ].map((item) => (
                <li key={item.label} className="flex items-center gap-3 text-white/80 text-sm group">
                  <div className="w-7 h-7 rounded-lg bg-scout-red/15 border border-scout-red/30 flex items-center justify-center flex-shrink-0 text-scout-red group-hover:bg-scout-red group-hover:text-white transition-all duration-200">
                    {item.icon}
                  </div>
                  {item.label}
                </li>
              ))}
            </ul>

            <a
              href="https://maps.google.com/?q=Potskampstraat+Oldenzaal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-scout-red text-white font-display font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-scout-darkred transition-all tracking-wide uppercase shadow-lg hover:shadow-scout-red/30 hover:-translate-y-0.5"
            >
              <MapPin className="w-4 h-4" />
              Bekijk op kaart
            </a>
          </div>
        </div>
      </div>

    </section>
  );
}

// ─── Lid Worden sectie ────────────────────────────────────────────────────────

const stapTilts = [-1.5, 0, 1.5];

function LidWorden({ onLidWorden }: { onLidWorden: () => void }) {
  return (
    <section id="lid-worden" className="relative bg-scout-cream texture-paper overflow-hidden py-24 px-6">
      {/* Big number watermark */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-forest-100 text-[24rem] font-bold leading-none pointer-events-none select-none opacity-40">
        TB
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-scout-red/10 border border-scout-red/20 text-scout-red font-medium text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-5">
            <ArrowRight className="w-3.5 h-3.5" /> Meedoen
          </div>
          <h2 className="font-display text-forest-950 text-5xl md:text-6xl font-bold uppercase leading-none mb-4">
            Kom bij ons<br /><span className="text-scout-red italic">op avontuur</span>
          </h2>
          <p className="text-forest-600 max-w-md mx-auto leading-relaxed">
            Geen verplichtingen, kom gewoon een keer langs. Je bent altijd welkom.
          </p>
        </div>

        {/* Steps — tilted cards with rope connect */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16 relative">
          {/* Rope between cards (desktop) */}
          <div className="absolute top-10 left-[20%] right-[20%] h-0.5 border-t-2 border-dashed border-forest-200 hidden md:block pointer-events-none" />

          {[
            {
              stap: '01',
              icon: <Compass className="w-7 h-7" />,
              titel: 'Kom kennismaken',
              tekst: 'Kom een paar keer langs bij de speltak die past bij jouw leeftijd. Volledig vrijblijvend.',
              color: 'bg-amber-500',
            },
            {
              stap: '02',
              icon: <Shield className="w-7 h-7" />,
              titel: 'Aanmelden',
              tekst: 'Enthousiast? Meld je aan via ons formulier en ontvang alle info over tijden en kampen.',
              color: 'bg-forest-600',
            },
            {
              stap: '03',
              icon: <Star className="w-7 h-7" />,
              titel: 'Avontuur begint!',
              tekst: 'Jij of jouw kind is lid! Elke week een bijeenkomst en een paar keer per jaar een echt kamp.',
              color: 'bg-scout-red',
            },
          ].map((s, i) => (
            <div
              key={s.stap}
              className="bg-white rounded-2xl border-2 border-forest-100 shadow-lg relative overflow-hidden hover:shadow-xl transition-shadow duration-300"
              style={{ transform: `rotate(${stapTilts[i]}deg)` }}
            >
              {/* Top stripe */}
              <div className={`${s.color} h-3`} />
              <div className="p-7 pt-5">
                {/* Step number */}
                <div className="font-display text-forest-100 text-7xl font-bold absolute -top-2 right-4 leading-none select-none">
                  {s.stap}
                </div>
                {/* Icon circle */}
                <div className={`w-12 h-12 ${s.color} rounded-xl flex items-center justify-center text-white mb-5 shadow-lg`}>
                  {s.icon}
                </div>
                <h3 className="font-display text-forest-950 font-bold text-xl uppercase mb-3 leading-tight">
                  {s.titel}
                </h3>
                <p className="text-forest-600 text-sm leading-relaxed">{s.tekst}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contributie banner — dark, adventurous */}
        <div
          className="relative bg-forest-950 rounded-2xl overflow-hidden mb-12"
          style={{ transform: 'rotate(-0.4deg)' }}
        >
          {/* Background campfire glow */}
          <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-20">
            <Campfire size={160} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/95 to-transparent" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 p-8 md:p-10">
            <div>
              <div className="font-display text-white text-2xl font-bold uppercase tracking-wide mb-2">
                Contributie
              </div>
              <p className="text-white/60 text-sm leading-relaxed max-w-lg">
                De contributie bedraagt €10,- per maand per lid. Dit dekt kosten voor gebouw,
                materialen, activiteiten, kampen en verzekering.
                <span className="text-white/40"> Financieel niet mogelijk? We zoeken altijd naar een oplossing.</span>
              </p>
            </div>
            <div className="text-center flex-shrink-0">
              <div className="font-display text-scout-red text-6xl font-bold leading-none">€10</div>
              <div className="text-white/40 text-xs tracking-widest uppercase mt-1">per maand</div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onLidWorden}
            className="group inline-flex items-center gap-3 bg-scout-red hover:bg-scout-darkred text-white font-display font-bold text-base px-10 py-5 rounded-full tracking-widest uppercase shadow-xl transition-colors duration-200 hover:-translate-y-0.5"
          >
            Direct aanmelden
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Nieuws ───────────────────────────────────────────────────────────────────

type BlogPost = {
  id: string;
  title: string;
  content: string;
  cover_image: string;
  published_at: string | null;
  post_date: string | null;
  created_at: string;
};

function extractExcerpt(content: string): string {
  try {
    const blocks = JSON.parse(content);
    if (Array.isArray(blocks)) {
      for (const block of blocks) {
        const raw: string = block.content ?? (block.columns ?? []).join(' ') ?? '';
        if (!raw) continue;
        const div = document.createElement('div');
        div.innerHTML = raw;
        const text = (div.textContent ?? div.innerText ?? '').trim();
        if (text) return text;
      }
    }
  } catch {
    // Legacy plain HTML
    const div = document.createElement('div');
    div.innerHTML = content;
    return (div.textContent ?? div.innerText ?? '').trim();
  }
  return '';
}

function Nieuws() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('id, title, slug, content, cover_image, published_at, post_date, created_at')
      .eq('published', true)
      .then(({ data }) => {
        const effectiveDate = (p: BlogPost) => {
          const raw = p.post_date ?? p.published_at ?? p.created_at;
          return new Date(raw.length === 10 ? raw + 'T00:00:00' : raw).getTime();
        };
        const sorted = (data ?? []).sort((a, b) => effectiveDate(b) - effectiveDate(a)).slice(0, 6);
        setPosts(sorted);
        setLoading(false);
      });
  }, []);

  return (
    <section id="nieuws" className="bg-forest-950 py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <p className="text-scout-red font-medium text-sm tracking-widest uppercase mb-3">
              Laatste nieuws
            </p>
            <h2 className="font-display text-white text-4xl md:text-5xl font-bold uppercase leading-none">
              Wat speelt er
            </h2>
          </div>
          <a
            href="/nieuws"
            className="text-white/50 hover:text-white text-sm font-medium flex items-center gap-1.5 transition-colors"
          >
            Alle berichten <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-forest-700 border-t-scout-red rounded-full animate-spin" />
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((post) => (
              <a
                key={post.id}
                href={`/nieuws/${post.slug}`}
                className="group bg-forest-900 rounded-2xl overflow-hidden border border-forest-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="h-48 overflow-hidden bg-forest-800 shrink-0">
                  {post.cover_image ? (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="w-8 h-8 text-forest-700" />
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="text-scout-red text-xs font-medium tracking-widest uppercase mb-3">
                    {new Date(post.post_date ?? post.published_at ?? post.created_at).toLocaleDateString('nl-NL', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </div>
                  <h3 className="font-display text-white text-xl font-bold uppercase mb-3 group-hover:text-scout-red transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-white/60 text-sm leading-relaxed line-clamp-3 flex-1">
                    {extractExcerpt(post.content)}
                  </p>
                  <span className="mt-4 flex items-center gap-1 text-scout-red font-medium text-sm group-hover:gap-2 transition-all">
                    Lees meer <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-white/30 text-sm">Nog geen nieuwsberichten.</div>
        )}
      </div>
    </section>
  );
}

// ─── Facebook ────────────────────────────────────────────────────────────────

const FB_SVG = (
  <svg viewBox="0 0 24 24" className="w-full h-full fill-white" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

function FacebookWidget() {
  useEffect(() => {
    if (document.getElementById('fb-sdk')) return;
    const script = document.createElement('script');
    script.id = 'fb-sdk';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.src = 'https://connect.facebook.net/nl_NL/sdk.js#xfbml=1&version=v21.0';
    document.body.appendChild(script);

    script.onload = () => {
      if ((window as Window & { FB?: { XFBML?: { parse: () => void } } }).FB?.XFBML) {
        (window as Window & { FB?: { XFBML?: { parse: () => void } } }).FB!.XFBML!.parse();
      }
    };
  }, []);

  return (
    <div id="fb-root">
      <div
        className="fb-page"
        data-href="https://www.facebook.com/ScoutingOldenzaal/"
        data-tabs="timeline"
        data-width="500"
        data-height="600"
        data-small-header="false"
        data-adapt-container-width="true"
        data-hide-cover="false"
        data-show-facepile="true"
      />
    </div>
  );
}

function Facebook() {
  return (
    <section className="relative overflow-hidden bg-scout-cream texture-paper py-28 px-6">

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-px w-8 bg-forest-300" />
            <span className="text-[11px] font-semibold text-forest-500 uppercase tracking-[0.2em]">Volg ons op</span>
            <div className="h-px w-8 bg-forest-300" />
          </div>
          <h2 className="font-display text-forest-950 text-4xl md:text-5xl font-bold uppercase leading-none">
            Facebook<span className="text-scout-red">.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">

          {/* Left: text + CTA */}
          <div className="lg:col-span-2 flex flex-col justify-center lg:pt-4">
            <p className="text-forest-600 leading-relaxed text-base mb-8">
              Blijf op de hoogte van het laatste nieuws, foto's en activiteiten via onze Facebook-pagina. Like ons en mis niets!
            </p>

            <div className="flex flex-col gap-3">
              <a
                href="https://www.facebook.com/ScoutingOldenzaal/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 text-white font-display font-semibold text-sm px-6 py-3.5 rounded-xl tracking-wide uppercase transition-opacity hover:opacity-85 shadow-md"
                style={{ background: '#1877F2' }}
              >
                <div className="w-4 h-4 shrink-0">{FB_SVG}</div>
                Pagina volgen
              </a>
              <a
                href="https://www.facebook.com/ScoutingOldenzaal/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-forest-800 font-display font-semibold text-sm px-6 py-3.5 rounded-xl tracking-wide uppercase border-2 border-forest-200 hover:border-forest-400 transition-colors"
              >
                Bekijk alle posts
              </a>
            </div>
          </div>

          {/* Right: Facebook embed */}
          <div className="lg:col-span-3 flex justify-center">
            <div className="w-full max-w-[500px] rounded-2xl overflow-hidden shadow-xl border border-forest-100">
              <FacebookWidget />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────

function Contact({ content }: { content: SiteSettings }) {
  const [formState, setFormState] = useState({ naam: '', email: '', onderwerp: '', bericht: '' });
  const [sent, setSent] = useState(false);
  const contactAddress = content.contact_address || 'Potskampstraat, Oldenzaal';
  const contactWa = content.contact_whatsapp || '+31 541 363 172';
  const contactHours = content.contact_hours || 'Wekelijks (tijden per speltak)';
  const waNumber = contactWa.replace(/\D/g, '');

  const inputCls =
    'w-full bg-forest-800 border border-forest-700 text-white placeholder-white/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-scout-red transition-colors';

  return (
    <section id="contact" className="bg-scout-cream py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <p className="text-scout-red font-medium text-sm tracking-widest uppercase mb-3">
              Contact
            </p>
            <h2 className="font-display text-forest-950 text-4xl md:text-5xl font-bold uppercase leading-none mb-8">
              Neem contact<br />op
            </h2>
            <p className="text-forest-600 leading-relaxed mb-10 max-w-md">
              Heb je een vraag, wil je meer informatie of wil je gewoon een keer langskomen? We
              staan altijd voor je klaar.
            </p>

            <div className="space-y-6 mb-10">
              {[
                {
                  icon: <MapPin className="w-5 h-5 text-scout-red" />,
                  label: 'Adres',
                  value: contactAddress,
                },
                {
                  icon: <MessageCircle className="w-5 h-5 text-scout-red" />,
                  label: 'WhatsApp',
                  value: contactWa,
                },
                {
                  icon: <Calendar className="w-5 h-5 text-scout-red" />,
                  label: 'Bijeenkomsten',
                  value: contactHours,
                },
              ].map((c) => (
                <div key={c.label} className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border border-forest-100 shadow-sm">
                    {c.icon}
                  </div>
                  <div>
                    <div className="text-forest-400 text-xs tracking-widest uppercase mb-1">
                      {c.label}
                    </div>
                    <div className="text-forest-950 font-medium">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-display font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#20b858] transition-all tracking-wide uppercase"
            >
              <MessageCircle className="w-4 h-4" />
              App ons op WhatsApp
            </a>
          </div>

          <div className="bg-forest-950 rounded-2xl p-8 border border-forest-800">
            <h3 className="font-display text-white text-xl font-bold uppercase tracking-wide mb-6">
              Stuur een bericht
            </h3>
            {sent ? (
              <div className="text-center py-10">
                <CheckCircle2 className="w-12 h-12 text-scout-red mx-auto mb-4" />
                <p className="text-white font-display text-lg uppercase font-bold mb-2">Verstuurd!</p>
                <p className="text-white/50 text-sm">We nemen zo snel mogelijk contact met je op.</p>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">Naam</label>
                    <input type="text" placeholder="Jouw naam" value={formState.naam}
                      onChange={(e) => setFormState(f => ({ ...f, naam: e.target.value }))}
                      className={inputCls} />
                  </div>
                  <div>
                    <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">E-mail</label>
                    <input type="email" placeholder="jouw@email.nl" value={formState.email}
                      onChange={(e) => setFormState(f => ({ ...f, email: e.target.value }))}
                      className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">Onderwerp</label>
                  <input type="text" placeholder="Waar gaat jouw vraag over?" value={formState.onderwerp}
                    onChange={(e) => setFormState(f => ({ ...f, onderwerp: e.target.value }))}
                    className={inputCls} />
                </div>
                <div>
                  <label className="text-white/50 text-xs tracking-widest uppercase block mb-2">Bericht</label>
                  <textarea rows={4} placeholder="Schrijf hier jouw bericht..." value={formState.bericht}
                    onChange={(e) => setFormState(f => ({ ...f, bericht: e.target.value }))}
                    className={inputCls + ' resize-none'} />
                </div>
                <button type="submit"
                  className="w-full bg-scout-red text-white font-display font-semibold text-sm py-4 rounded-full hover:bg-scout-darkred transition-all tracking-widest uppercase">
                  Verstuur bericht
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── WhatsApp Widget ──────────────────────────────────────────────────────────

const WA_NUMBER = '31541363172';

function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  function handleSend() {
    const text = message.trim();
    if (!text) return;
    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setMessage('');
    setOpen(false);
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 w-fit pointer-events-none">
      {/* Chat panel */}
      <div
        className={`transition-all duration-300 origin-bottom-right ${
          open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-[#25D366] px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-semibold text-sm leading-tight">Scouting Titus Brandsma</div>
              <div className="text-white/70 text-xs">Antwoord doorgaans snel</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="ml-auto text-white/70 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Bubble */}
          <div className="px-4 py-5 bg-[#f0f2f5]">
            <div className="bg-white rounded-xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[90%]">
              <p className="text-gray-700 text-sm leading-relaxed">
                Hoi! Heb je een vraag of wil je meer weten over Scouting Titus Brandsma? Stuur ons een berichtje!
              </p>
              <p className="text-gray-400 text-[10px] mt-1 text-right">Scouting TB</p>
            </div>
          </div>

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-gray-100 flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder="Typ een bericht..."
              className="flex-1 resize-none bg-gray-100 rounded-xl px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#25D366] max-h-28 overflow-y-auto"
              style={{ lineHeight: '1.4' }}
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center shrink-0 hover:bg-[#20b858] disabled:opacity-40 transition"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="pointer-events-auto w-14 h-14 rounded-full bg-[#25D366] shadow-xl flex items-center justify-center hover:bg-[#20b858] hover:scale-110 transition-all duration-200"
        aria-label="WhatsApp chat openen"
      >
        {open ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        )}
      </button>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

type FooterLink = { id: number; label: string; href: string; link_type: string };

function Footer({ content }: { content: SiteSettings }) {
  const tagline = content.footer_tagline || 'Oldenzaal · Sinds 1945';
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
              <div className="text-white font-display font-bold text-sm uppercase tracking-wide leading-tight">
                Scouting Titus Brandsma
              </div>
              <div className="text-white/35 text-[11px] tracking-wide">{tagline}</div>
            </div>
          </div>

          <div className="flex items-center gap-6 flex-wrap justify-center">
            {footerLinks.map((l) => (
              <a key={l.id} href={l.href || '#'}
                target={l.link_type === 'external' && l.href.startsWith('http') ? '_blank' : undefined}
                rel={l.link_type === 'external' && l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="text-white/35 hover:text-white/70 text-xs tracking-wide transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          <p className="text-white/20 text-xs">© {new Date().getFullYear()} Alle rechten voorbehouden</p>
        </div>

        <div className="mt-6 pt-5 border-t border-forest-900" />
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [showPopup, setShowPopup] = useState(false);
  const content = useHomepageContent();

  return (
    <div className="font-sans">
      <AdminTopbar />
      <NavBar onLidWorden={() => setShowPopup(true)} />
      <Hero onLidWorden={() => setShowPopup(true)} content={content} />
      <DividerDarkToCream />
      <Speltakken content={content} />
      <DividerCreamToDark />
      <OverOns content={content} />
      <DividerDarkToCream />
      <VideoSection content={content} />
      <DividerCreamToDark />
      <Gebouw content={content} />
      <DividerDarkToCream />
      <LidWorden onLidWorden={() => setShowPopup(true)} />
      <DividerCreamToDark />
      <Nieuws />
      <DividerDarkToCream />
      <Facebook />
      <Contact content={content} />
      <DividerCreamToDark />
      <Footer content={content} />

      {showPopup && <LidWordenPopup onClose={() => setShowPopup(false)} content={content} />}
      <WhatsAppWidget />
    </div>
  );
}
