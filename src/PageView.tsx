import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { renderBlocks } from './admin/RichEditor';
import { ArrowLeft, Lock, Menu, X, ArrowRight, Flame, Users, TreePine, Shield, MapPin, Calendar } from 'lucide-react';
import { NavIcon, hasNavIcon } from './lib/navIcon';

type NavItem = {
  id: string;
  label: string;
  href: string;
  open_in_new_tab: boolean;
  icon: string;
};

const FALLBACK_LINKS: NavItem[] = [
  { id: '1', label: 'Speltakken', href: '/#speltakken', open_in_new_tab: false },
  { id: '2', label: 'Over ons',   href: '/#over-ons',   open_in_new_tab: false },
  { id: '3', label: 'Ons gebouw', href: '/#gebouw',     open_in_new_tab: false },
  { id: '4', label: 'Nieuws',     href: '/#nieuws',     open_in_new_tab: false },
  { id: '5', label: 'Contact',    href: '/#contact',    open_in_new_tab: false },
];
import AdminTopbar from './admin/AdminTopbar';

type Page = {
  id: string;
  title: string;
  slug: string;
  hero_subtitle: string;
  hero_image: string;
  content: string;
  published: boolean;
  visibility: 'public' | 'private' | 'password';
  password: string;
  seo_title: string;
  seo_description: string;
};

// ─── Shared NavBar ────────────────────────────────────────────────────────────

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
      .select('id, label, href, open_in_new_tab')
      .order('position')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setLinks(data.map(l => ({
            ...l,
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
            <a
              key={l.id}
              href={l.href}
              target={l.open_in_new_tab ? '_blank' : undefined}
              rel={l.open_in_new_tab ? 'noopener noreferrer' : undefined}
              title={hasNavIcon(l.icon) ? l.label : undefined}
              className="text-white/80 hover:text-white text-sm font-medium tracking-wide transition-colors"
            >
              {hasNavIcon(l.icon)
                ? <NavIcon icon={l.icon} className="w-5 h-5" />
                : l.label}
            </a>
          ))}
        </nav>

        <a
          href="/#lid-worden"
          className="group hidden md:flex items-center gap-2 bg-scout-red hover:bg-scout-darkred text-white font-display font-semibold text-sm px-5 py-2.5 rounded-full tracking-wide uppercase transition-colors duration-200"
        >
          Lid worden
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
              href="/#lid-worden"
              onClick={() => setOpen(false)}
              className="mt-2 inline-flex items-center gap-2 bg-scout-red text-white font-display font-semibold text-sm px-5 py-3 rounded-full w-fit tracking-wide uppercase"
            >
              Lid worden <ArrowRight className="w-4 h-4" />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

// ─── Shared Footer ────────────────────────────────────────────────────────────

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

// ─── Over Ons Page Layout ─────────────────────────────────────────────────────

const TIMELINE = [
  {
    year: '1930s',
    title: 'De eerste stappen',
    text: 'Op bescheiden schaal ontstaat scouting in Oldenzaal. De padvinderij vindt langzaam zijn weg naar de jeugd van de stad.',
    icon: <MapPin className="w-4 h-4" />,
  },
  {
    year: '1940–45',
    title: 'Verboden avontuur',
    text: 'De bezetter verbiedt samenscholing. De wekelijkse bijeenkomsten stoppen gedwongen — maar de geest van de scouting blijft leven.',
    icon: <Shield className="w-4 h-4" />,
  },
  {
    year: '1945',
    title: 'Wedergeboorte',
    text: 'Direct na de bevrijding blazen de Oldenzaalse parochies de padvinderij nieuw leven in. Drie groepen worden opgericht: de Paulusgroep, St. Tarcisiusgroep en St. Agnesgroep.',
    icon: <Flame className="w-4 h-4" />,
  },
  {
    year: '1970s',
    title: 'Fusie & nieuwe thuis',
    text: 'Na een strijd om de locatie aan de Bleekstraat fuseren de Paulus- en Tarcisiusgroep. Scouting Titus Brandsma is geboren. Het ledenantal schiet omhoog.',
    icon: <Users className="w-4 h-4" />,
  },
  {
    year: '1980',
    title: 'Één grote familie',
    text: 'De St. Agnesgroep sluit zich aan. Jongens en meisjes samen onder één dak aan de Potskampstraat — de hechte scoutingfamilie die we vandaag de dag zijn.',
    icon: <TreePine className="w-4 h-4" />,
  },
  {
    year: 'Vandaag',
    title: '70+ jaar avontuur',
    text: 'Met ruim 40 vrijwilligers en zes speltakken voor kinderen van 5 tot 21+ biedt Scouting Titus Brandsma elke week een avontuur om nooit te vergeten.',
    icon: <Calendar className="w-4 h-4" />,
  },
];

function OverOnsPageLayout({ page }: { page: { title: string; seo_title: string; hero_subtitle: string; hero_image: string; slug: string } }) {
  return (
    <div className="min-h-screen bg-forest-950">
      <AdminTopbar pageSlug={page.slug} />
      <title>{page.seo_title || page.title}</title>
      <NavBar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ minHeight: '560px', display: 'flex', flexDirection: 'column' }}>

        {/* Background photo or gradient */}
        {page.hero_image ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${page.hero_image})`, animation: 'heroZoom 16s ease-out forwards', transform: 'scale(1.06)' }}
          />
        ) : (
          <>
            <img
              src="/jubileum_groepsfoto.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover object-top"
              style={{ animation: 'heroZoom 20s ease-out forwards', transform: 'scale(1.06)' }}
            />
          </>
        )}

        {/* Layered overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/55 via-forest-950/30 to-forest-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/70 via-transparent to-forest-950/30" />

        {/* Grain */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '200px 200px' }}
        />

        {/* Pine silhouettes */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden opacity-[0.09]">
          <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="xMidYMax slice">
            {[0,130,260,390,520,650,780,910,1040,1170,1300].map((x, i) => (
              <polygon key={i} points={`${x},120 ${x+45},60 ${x+25},72 ${x+45},30 ${x+65},72 ${x+85},60 ${x+90},120`} fill="white" />
            ))}
          </svg>
        </div>

        {/* Hero content */}
        <div className="relative z-10 flex-1 flex flex-col justify-end px-6 pb-20 pt-40 max-w-7xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/25 text-orange-400 font-medium text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-5 w-fit"
            style={{ animation: 'fadeSlideUp 0.5s 0.1s ease both' }}
          >
            Scouting Titus Brandsma · Oldenzaal
          </div>
          <h1
            className="font-display font-bold text-white uppercase leading-none mb-5"
            style={{ fontSize: 'clamp(3rem, 9vw, 6.5rem)', letterSpacing: '-0.02em', animation: 'fadeSlideUp 0.6s 0.15s ease both' }}
          >
            {page.title}<span className="text-scout-red">.</span>
          </h1>
          <p
            className="text-white/55 text-lg max-w-xl leading-relaxed font-light"
            style={{ animation: 'fadeSlideUp 0.6s 0.25s ease both' }}
          >
            {page.hero_subtitle || 'Meer dan 70 jaar kampvuren, vriendschappen en avontuur in het hart van Oldenzaal.'}
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap gap-6 mt-10" style={{ animation: 'fadeSlideUp 0.6s 0.35s ease both' }}>
            {[
              { v: '1945', l: 'Opgericht' },
              { v: '70+', l: 'Jaar avontuur' },
              { v: '40+', l: 'Vrijwilligers' },
              { v: '6', l: 'Speltakken' },
            ].map(s => (
              <div key={s.l} className="text-center">
                <div className="font-display text-2xl font-bold text-orange-400 leading-none">{s.v}</div>
                <div className="text-white/40 text-xs uppercase tracking-widest mt-0.5">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Timeline section ──────────────────────────────────────────────── */}
      <div className="relative bg-forest-950 px-6 py-24">

        {/* Starfield */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
          {[[80,30],[220,70],[420,20],[680,55],[900,35],[1100,60],[1280,25],[150,130],[500,110],[750,140],[1050,100],[1350,120]].map(([x,y],i) => (
            <div key={i} className="absolute rounded-full bg-white"
              style={{ left: x, top: y, width: i%3===0?2:1.5, height: i%3===0?2:1.5, opacity: 0.1+(i%4)*0.06 }}
            />
          ))}
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 font-medium text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-4">
              Onze geschiedenis
            </div>
            <h2 className="font-display text-white text-4xl md:text-5xl font-bold uppercase leading-tight">
              Van vonk tot vlam
            </h2>
          </div>

          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-forest-700 to-transparent md:-translate-x-px" />

            <div className="space-y-10">
              {TIMELINE.map((item, i) => (
                <div
                  key={item.year}
                  className={`relative flex gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Text block */}
                  <div className={`md:w-[calc(50%-2.5rem)] pl-14 md:pl-0 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className={`inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-2 ${i % 2 === 0 ? 'md:ml-auto' : ''}`}>
                      {item.year}
                    </div>
                    <h3 className="font-display text-white font-bold text-lg uppercase tracking-wide mb-2">{item.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{item.text}</p>
                  </div>

                  {/* Center dot */}
                  <div className="absolute left-0 md:left-1/2 top-1 md:-translate-x-1/2 flex-shrink-0">
                    <div className="w-14 h-14 md:w-10 md:h-10 rounded-full bg-forest-900 border-2 border-orange-500/50 flex items-center justify-center text-orange-400 shadow-lg shadow-orange-900/20">
                      {item.icon}
                    </div>
                  </div>

                  {/* Empty spacer for opposite side */}
                  <div className="hidden md:block md:w-[calc(50%-2.5rem)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Photo + quote band ────────────────────────────────────────────── */}
      <div className="relative bg-forest-900 overflow-hidden">
        <img
          src="/jubileum_groepsfoto.jpg"
          alt="Jubileum groepsfoto"
          className="w-full h-64 md:h-80 object-cover object-top opacity-30"
        />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="text-center max-w-2xl">
            <div className="font-display text-white text-2xl md:text-4xl font-bold uppercase leading-tight mb-4">
              "De natuur is onze tweede thuis"
            </div>
            <p className="text-white/45 text-sm tracking-wider uppercase">Scouting Titus Brandsma · Oldenzaal · Sinds 1945</p>
          </div>
        </div>
      </div>

      {/* ── Values section ────────────────────────────────────────────────── */}
      <div className="bg-scout-cream px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-forest-800/10 border border-forest-700/20 text-forest-700 font-medium text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-4">
              Wie zijn wij
            </div>
            <h2 className="font-display text-forest-950 text-4xl md:text-5xl font-bold uppercase leading-tight">
              Meer dan een club
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Users className="w-7 h-7" />,
                title: 'Gemeenschap',
                text: 'Van Bever tot Stam — iedereen is welkom. We bouwen aan vriendschappen die een leven lang meegaan, gesmeed rond het kampvuur.',
                accent: 'bg-amber-500',
              },
              {
                icon: <TreePine className="w-7 h-7" />,
                title: 'Natuur & avontuur',
                text: 'Bossen, rivieren en velden zijn onze speeltuin. We leren overleven, navigeren en verwonderen ons iedere week opnieuw.',
                accent: 'bg-forest-600',
              },
              {
                icon: <Shield className="w-7 h-7" />,
                title: 'Vrijwilligers',
                text: 'Meer dan 40 gepassioneerde leiders staan elke week klaar. Zij geven hun vrije tijd om de volgende generatie te inspireren.',
                accent: 'bg-scout-red',
              },
            ].map(v => (
              <div key={v.title} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:-translate-y-1 transition-all duration-300">
                <div className={`${v.accent} h-1.5 w-full`} />
                <div className="p-7">
                  <div className={`w-12 h-12 rounded-xl ${v.accent} bg-opacity-10 flex items-center justify-center mb-5`}
                    style={{ backgroundColor: `color-mix(in srgb, currentColor 10%, transparent)` }}>
                    <span className="text-forest-800">{v.icon}</span>
                  </div>
                  <h3 className="font-display text-forest-950 font-bold text-lg uppercase tracking-wide mb-3">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <div className="bg-forest-950 px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-white text-3xl md:text-4xl font-bold uppercase mb-4">
            Doe jij mee?
          </h2>
          <p className="text-white/50 mb-8 leading-relaxed">
            Of je nu 5 of 50 jaar bent — er is een plek voor jou bij Scouting Titus Brandsma.
          </p>
          <a
            href="/#lid-worden"
            className="inline-flex items-center gap-2 bg-scout-red hover:bg-scout-darkred text-white font-display font-semibold text-sm px-8 py-4 rounded-full tracking-widest uppercase transition-colors duration-200 group"
          >
            Lid worden
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>

      {/* ── Back link ─────────────────────────────────────────────────────── */}
      <div className="bg-forest-950 px-6 pb-10 flex justify-center">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-white/30 hover:text-white/60 transition group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Terug naar home
        </a>
      </div>

      <Footer />
    </div>
  );
}

// ─── PageView ─────────────────────────────────────────────────────────────────

export default function PageView({ slug }: { slug: string }) {
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (!data || data.visibility === 'private') {
        setNotFound(true);
      } else {
        setPage(data);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-forest-950 flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !page) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="text-6xl font-bold text-gray-200">404</div>
        <h1 className="text-xl font-semibold text-gray-700">Pagina niet gevonden</h1>
        <p className="text-gray-400 text-sm max-w-sm">De pagina die je zoekt bestaat niet of is niet openbaar beschikbaar.</p>
        <a href="/" className="inline-flex items-center gap-2 mt-2 text-sm font-medium text-forest-700 hover:text-forest-900 transition">
          <ArrowLeft className="w-4 h-4" /> Terug naar home
        </a>
      </div>
    );
  }

  // Password gate
  if (page.visibility === 'password' && !unlocked) {
    return (
      <div className="min-h-screen bg-forest-950 flex flex-col items-center justify-center px-6">
        <AdminTopbar pageSlug={slug} />
        <div className="bg-forest-900 border border-forest-800 rounded-2xl p-8 w-full max-w-sm text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-forest-800 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-5 h-5 text-white/60" />
          </div>
          <h1 className="font-display font-bold text-white text-xl uppercase tracking-wide mb-1">{page.title}</h1>
          <p className="text-white/40 text-sm mb-5">Deze pagina is beveiligd met een wachtwoord.</p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (passwordInput === page.password) { setUnlocked(true); }
                else { setPasswordError(true); }
              }
            }}
            placeholder="Wachtwoord"
            className={`w-full bg-forest-800 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 transition mb-3 ${passwordError ? 'border-red-500 focus:ring-red-500/30' : 'border-forest-700 focus:ring-forest-400/40'}`}
          />
          {passwordError && <p className="text-red-400 text-xs mb-3">Onjuist wachtwoord.</p>}
          <button
            onClick={() => {
              if (passwordInput === page.password) { setUnlocked(true); }
              else { setPasswordError(true); }
            }}
            className="w-full bg-scout-red hover:bg-scout-darkred text-white font-display font-semibold py-2.5 rounded-xl text-sm uppercase tracking-wide transition"
          >
            Toegang
          </button>
        </div>
      </div>
    );
  }

  // Special layout for Over Ons page
  if (slug === 'over-ons') {
    return <OverOnsPageLayout page={page} />;
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminTopbar pageSlug={slug} />
      <title>{page.seo_title || page.title}</title>

      <NavBar />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div className="relative bg-forest-950 overflow-hidden" style={{ minHeight: '480px', display: 'flex', flexDirection: 'column' }}>

        {/* Background */}
        {page.hero_image ? (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${page.hero_image})`,
              animation: 'heroZoom 16s ease-out forwards',
              transform: 'scale(1.06)',
            }}
          />
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_60%_-10%,rgba(46,101,55,0.45),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_20%_80%,rgba(180,30,30,0.12),transparent)]" />
          </>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/60 via-forest-950/45 to-forest-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(7,26,11,0.6)_100%)]" />

        {/* Decorative pine silhouettes bottom */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden opacity-[0.07]">
          <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="xMidYMax slice">
            {[0,130,260,390,520,650,780,910,1040,1170,1300].map((x, i) => (
              <polygon key={i} points={`${x},120 ${x+45},60 ${x+25},72 ${x+45},30 ${x+65},72 ${x+85},60 ${x+90},120`} fill="white" />
            ))}
          </svg>
        </div>

        {/* Grain */}
        <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '200px 200px' }}
        />

        {/* Content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-32 pb-20">

          {/* Title */}
          <h1
            className="font-display font-bold text-white uppercase leading-none mb-6"
            style={{ fontSize: 'clamp(2.4rem, 7vw, 5rem)', letterSpacing: '-0.01em', animation: 'fadeSlideUp 0.6s 0.1s ease both' }}
          >
            {page.title}
            <span className="text-scout-red">.</span>
          </h1>

          {/* Subtitle */}
          {page.hero_subtitle && (
            <p
              className="text-white/60 text-base md:text-lg max-w-2xl leading-relaxed font-light"
              style={{ animation: 'fadeSlideUp 0.6s 0.2s ease both' }}
            >
              {page.hero_subtitle}
            </p>
          )}

        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 leading-none">
          <svg viewBox="0 0 1440 72" xmlns="http://www.w3.org/2000/svg" className="w-full block" preserveAspectRatio="none">
            <path d="M0,72 L0,40 C240,72 480,8 720,24 C960,40 1200,72 1440,40 L1440,72 Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 py-14">
        {renderBlocks(page.content)}
      </div>

      {/* Back link */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <a href="/" className="inline-flex items-center gap-2 text-sm font-medium text-forest-700 hover:text-forest-900 transition group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Terug naar home
        </a>
      </div>

      <Footer />
    </div>
  );
}
