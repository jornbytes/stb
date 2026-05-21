import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { renderBlocks } from './admin/RichEditor';
import { ArrowLeft, Lock, Menu, X, ArrowRight, Flame, Users, TreePine, Shield, MapPin, Calendar, Home, UtensilsCrossed, Tent, Star, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
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
  hero_image_position: string;
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
      .select('id, label, href, open_in_new_tab, icon')
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

const TIMELINE_ICONS = [
  <MapPin className="w-4 h-4" />,
  <Shield className="w-4 h-4" />,
  <Flame className="w-4 h-4" />,
  <Users className="w-4 h-4" />,
  <TreePine className="w-4 h-4" />,
  <Calendar className="w-4 h-4" />,
];

const TIMELINE_DEFAULTS = [
  { year: '1930s',   title: 'De eerste stappen',   text: 'Op bescheiden schaal ontstaat scouting in Oldenzaal. De padvinderij vindt langzaam zijn weg naar de jeugd van de stad.' },
  { year: '1940–45', title: 'Verboden avontuur',    text: 'De bezetter verbiedt samenscholing. De wekelijkse bijeenkomsten stoppen gedwongen — maar de geest van de scouting blijft leven.' },
  { year: '1945',    title: 'Wedergeboorte',         text: 'Direct na de bevrijding blazen de Oldenzaalse parochies de padvinderij nieuw leven in. Drie groepen worden opgericht: de Paulusgroep, St. Tarcisiusgroep en St. Agnesgroep.' },
  { year: '1970s',   title: 'Fusie & nieuwe thuis', text: 'Na een strijd om de locatie aan de Bleekstraat fuseren de Paulus- en Tarcisiusgroep. Scouting Titus Brandsma is geboren. Het ledenantal schiet omhoog.' },
  { year: '1980',    title: 'Één grote familie',     text: 'De St. Agnesgroep sluit zich aan. Jongens en meisjes samen onder één dak aan de Potskampstraat — de hechte scoutingfamilie die we vandaag de dag zijn.' },
  { year: 'Vandaag', title: '70+ jaar avontuur',     text: 'Met ruim 40 vrijwilligers en zes speltakken voor kinderen van 5 tot 21+ biedt Scouting Titus Brandsma elke week een avontuur om nooit te vergeten.' },
];

const VALUES_DEFAULTS = [
  { title: 'Gemeenschap',      text: 'Van Bever tot Stam — iedereen is welkom. We bouwen aan vriendschappen die een leven lang meegaan, gesmeed rond het kampvuur.',        accent: 'bg-amber-500',   icon: <Users className="w-7 h-7" /> },
  { title: 'Natuur & avontuur', text: 'Bossen, rivieren en velden zijn onze speeltuin. We leren overleven, navigeren en verwonderen ons iedere week opnieuw.',              accent: 'bg-forest-600',  icon: <TreePine className="w-7 h-7" /> },
  { title: 'Vrijwilligers',    text: 'Meer dan 40 gepassioneerde leiders staan elke week klaar. Zij geven hun vrije tijd om de volgende generatie te inspireren.',           accent: 'bg-scout-red',   icon: <Shield className="w-7 h-7" /> },
];

type OverOnsSettings = Record<string, string>;

function useOverOnsSettings() {
  const [s, setS] = useState<OverOnsSettings>({});
  useEffect(() => {
    supabase.from('site_settings').select('key, value')
      .then(({ data }) => {
        const m: OverOnsSettings = {};
        (data ?? []).forEach(r => { m[r.key] = r.value ?? ''; });
        setS(m);
      });
  }, []);
  return s;
}

function OverOnsPageLayout({ page }: { page: { title: string; seo_title: string; hero_subtitle: string; hero_image: string; hero_image_position: string; slug: string } }) {
  const s = useOverOnsSettings();

  const stats = [
    { v: s.overons_stat_1_value || '1945', l: s.overons_stat_1_label || 'Opgericht' },
    { v: s.overons_stat_2_value || '70+',  l: s.overons_stat_2_label || 'Jaar avontuur' },
    { v: s.overons_stat_3_value || '40+',  l: s.overons_stat_3_label || 'Vrijwilligers' },
    { v: s.overons_stat_4_value || '6',    l: s.overons_stat_4_label || 'Speltakken' },
  ];

  const timeline = TIMELINE_DEFAULTS.map((d, i) => ({
    year:  s[`overons_tl_${i+1}_year`]  || d.year,
    title: s[`overons_tl_${i+1}_title`] || d.title,
    text:  s[`overons_tl_${i+1}_text`]  || d.text,
    icon:  TIMELINE_ICONS[i],
  }));

  const values = VALUES_DEFAULTS.map((d, i) => ({
    title:  s[`overons_val_${i+1}_title`] || d.title,
    text:   s[`overons_val_${i+1}_text`]  || d.text,
    accent: d.accent,
    icon:   d.icon,
  }));

  return (
    <div className="min-h-screen bg-forest-950">
      <AdminTopbar pageSlug={page.slug} />
      <title>{page.seo_title || page.title}</title>
      <NavBar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ minHeight: '560px', display: 'flex', flexDirection: 'column' }}>

        {page.hero_image ? (
          <div
            className="absolute inset-0 bg-cover"
            style={{ backgroundImage: `url(${page.hero_image})`, backgroundPosition: page.hero_image_position || 'center', animation: 'heroZoom 16s ease-out forwards', transform: 'scale(1.06)' }}
          />
        ) : (
          <img
            src="/jubileum_groepsfoto.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-top"
            style={{ animation: 'heroZoom 20s ease-out forwards', transform: 'scale(1.06)' }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/55 via-forest-950/30 to-forest-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/70 via-transparent to-forest-950/30" />
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '200px 200px' }}
        />
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden opacity-[0.09]">
          <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="xMidYMax slice">
            {[0,130,260,390,520,650,780,910,1040,1170,1300].map((x, i) => (
              <polygon key={i} points={`${x},120 ${x+45},60 ${x+25},72 ${x+45},30 ${x+65},72 ${x+85},60 ${x+90},120`} fill="white" />
            ))}
          </svg>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-end px-6 pb-20 pt-40 max-w-7xl mx-auto w-full">
          <div className="inline-flex items-center gap-2 bg-orange-500/15 border border-orange-500/25 text-orange-400 font-medium text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-5 w-fit"
            style={{ animation: 'fadeSlideUp 0.5s 0.1s ease both' }}
          >
            {s.overons_hero_badge || 'Scouting Titus Brandsma · Oldenzaal'}
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
            {page.hero_subtitle || s.overons_hero_subtitle || 'Meer dan 70 jaar kampvuren, vriendschappen en avontuur in het hart van Oldenzaal.'}
          </p>

          <div className="flex flex-wrap gap-6 mt-10" style={{ animation: 'fadeSlideUp 0.6s 0.35s ease both' }}>
            {stats.map(st => (
              <div key={st.l} className="text-center">
                <div className="font-display text-2xl font-bold text-orange-400 leading-none">{st.v}</div>
                <div className="text-white/40 text-xs uppercase tracking-widest mt-0.5">{st.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Timeline section ──────────────────────────────────────────────── */}
      <div className="relative bg-forest-950 px-6 py-24">
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
              {s.overons_tl_badge || 'Onze geschiedenis'}
            </div>
            <h2 className="font-display text-white text-4xl md:text-5xl font-bold uppercase leading-tight">
              {s.overons_tl_title || 'Van vonk tot vlam'}
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-forest-700 to-transparent md:-translate-x-px" />
            <div className="space-y-10">
              {timeline.map((item, i) => (
                <div
                  key={i}
                  className={`relative flex gap-6 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`md:w-[calc(50%-2.5rem)] pl-14 md:pl-0 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <div className={`inline-flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-2 ${i % 2 === 0 ? 'md:ml-auto' : ''}`}>
                      {item.year}
                    </div>
                    <h3 className="font-display text-white font-bold text-lg uppercase tracking-wide mb-2">{item.title}</h3>
                    <p className="text-white/50 text-sm leading-relaxed">{item.text}</p>
                  </div>
                  <div className="absolute left-0 md:left-1/2 top-1 md:-translate-x-1/2 flex-shrink-0">
                    <div className="w-14 h-14 md:w-10 md:h-10 rounded-full bg-forest-900 border-2 border-orange-500/50 flex items-center justify-center text-orange-400 shadow-lg shadow-orange-900/20">
                      {item.icon}
                    </div>
                  </div>
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
          src={s.overons_quote_photo || '/jubileum_groepsfoto.jpg'}
          alt="Groepsfoto"
          className="w-full h-64 md:h-80 object-cover object-top opacity-30"
        />
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div className="text-center max-w-2xl">
            <div className="font-display text-white text-2xl md:text-4xl font-bold uppercase leading-tight mb-4">
              "{s.overons_quote_text || 'De natuur is onze tweede thuis'}"
            </div>
            <p className="text-white/45 text-sm tracking-wider uppercase">
              {s.overons_quote_sub || 'Scouting Titus Brandsma · Oldenzaal · Sinds 1945'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Values section ────────────────────────────────────────────────── */}
      <div className="bg-scout-cream px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-forest-800/10 border border-forest-700/20 text-forest-700 font-medium text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-4">
              {s.overons_values_badge || 'Wie zijn wij'}
            </div>
            <h2 className="font-display text-forest-950 text-4xl md:text-5xl font-bold uppercase leading-tight">
              {s.overons_values_title || 'Meer dan een club'}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map(v => (
              <div key={v.title} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group hover:-translate-y-1 transition-all duration-300">
                <div className={`${v.accent} h-1.5 w-full`} />
                <div className="p-7">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5`}
                    style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
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
            {s.overons_cta_title || 'Doe jij mee?'}
          </h2>
          <p className="text-white/50 mb-8 leading-relaxed">
            {s.overons_cta_text || 'Of je nu 5 of 50 jaar bent — er is een plek voor jou bij Scouting Titus Brandsma.'}
          </p>
          <a
            href="/#lid-worden"
            className="inline-flex items-center gap-2 bg-scout-red hover:bg-scout-darkred text-white font-display font-semibold text-sm px-8 py-4 rounded-full tracking-widest uppercase transition-colors duration-200 group"
          >
            {s.overons_cta_button || 'Lid worden'}
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

// ─── Ons Gebouw Page Layout ───────────────────────────────────────────────────

const GEBOUW_FOTOS = [
  'https://jurwwletlrkjzhovyjxw.supabase.co/storage/v1/object/public/media/1777119540583-3dks8x1ixvr.jpg',
  'https://jurwwletlrkjzhovyjxw.supabase.co/storage/v1/object/public/media/1777119540329-us38zw5pyva.jpg',
  'https://jurwwletlrkjzhovyjxw.supabase.co/storage/v1/object/public/media/1777119539958-t09vj1xlgon.jpg',
  'https://jurwwletlrkjzhovyjxw.supabase.co/storage/v1/object/public/media/1777119539716-q1zi6uaa3zh.jpg',
  'https://jurwwletlrkjzhovyjxw.supabase.co/storage/v1/object/public/media/1777119539440-0ve119u8yhm.jpg',
  'https://jurwwletlrkjzhovyjxw.supabase.co/storage/v1/object/public/media/1777119538526-u34o263dxfj.jpg',
  'https://jurwwletlrkjzhovyjxw.supabase.co/storage/v1/object/public/media/1777119538107-aanom4il1qp.jpg',
];

const GEBOUW_FACILITEITEN = [
  {
    icon: <Home className="w-6 h-6" />,
    title: 'Grote zaal',
    text: 'De centrale ruimte voor spel, opkomsten en groepsbijeenkomsten. Ruim genoeg voor de grootste groepen.',
  },
  {
    icon: <UtensilsCrossed className="w-6 h-6" />,
    title: 'Keuken',
    text: 'Samen koken tijdens bijzondere avonden en kampen. Een vertrouwde plek voor gezelligheid.',
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Vergaderruimtes',
    text: 'Aparte ruimtes voor de oudere speltakken zoals Explorers en de Stam voor vergaderingen en planningen.',
  },
  {
    icon: <Tent className="w-6 h-6" />,
    title: 'Buitenterrein',
    text: 'Het terrein rondom het gebouw is perfect voor buitenactiviteiten, spelletjes en het oefenen van scoutingvaardigheden.',
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: 'Creatieve ruimtes',
    text: 'Plekken om te knutselen, te leren en te plannen. Ideaal voor uitlegmomenten en creatieve projecten.',
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: 'Veilige omgeving',
    text: 'Een vertrouwde thuisbasis waar iedereen zich welkom voelt en jongeren veilig kunnen groeien.',
  },
];

function GebouwLightbox({ photos, startIndex, onClose }: { photos: string[]; startIndex: number; onClose: () => void }) {
  const [idx, setIdx] = useState(startIndex);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + photos.length) % photos.length);
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % photos.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [photos.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center px-4"
      onClick={onClose}
    >
      <button
        onClick={(e) => { e.stopPropagation(); setIdx(i => (i - 1 + photos.length) % photos.length); }}
        className="absolute left-4 md:left-8 text-white/60 hover:text-white transition p-2 z-10"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>
      <img
        src={photos[idx]}
        alt=""
        className="max-h-[85vh] max-w-[90vw] rounded-xl shadow-2xl object-contain"
        onClick={e => e.stopPropagation()}
      />
      <button
        onClick={(e) => { e.stopPropagation(); setIdx(i => (i + 1) % photos.length); }}
        className="absolute right-4 md:right-8 text-white/60 hover:text-white transition p-2 z-10"
      >
        <ChevronRightIcon className="w-8 h-8" />
      </button>
      <button onClick={onClose} className="absolute top-5 right-5 text-white/50 hover:text-white transition">
        <X className="w-6 h-6" />
      </button>
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/30 text-sm">
        {idx + 1} / {photos.length}
      </div>
    </div>
  );
}

function OnsGebouwPageLayout({ page }: { page: { title: string; seo_title: string; hero_subtitle: string; hero_image: string; hero_image_position: string; slug: string } }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const heroImg = page.hero_image || GEBOUW_FOTOS[0];

  return (
    <div className="min-h-screen bg-forest-950">
      <AdminTopbar pageSlug={page.slug} />
      <title>{page.seo_title || page.title}</title>
      <NavBar />

      {lightboxIdx !== null && (
        <GebouwLightbox photos={GEBOUW_FOTOS} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
        <div
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: `url(${heroImg})`, backgroundPosition: page.hero_image_position || 'center', animation: 'heroZoom 20s ease-out forwards', transform: 'scale(1.06)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/50 via-forest-950/20 to-forest-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/70 via-transparent to-transparent" />

        {/* Grain */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: '200px 200px' }}
        />

        {/* Pine silhouettes */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden opacity-[0.08]">
          <svg viewBox="0 0 1440 120" className="w-full" preserveAspectRatio="xMidYMax slice">
            {[0,130,260,390,520,650,780,910,1040,1170,1300].map((x, i) => (
              <polygon key={i} points={`${x},120 ${x+45},60 ${x+25},72 ${x+45},30 ${x+65},72 ${x+85},60 ${x+90},120`} fill="white" />
            ))}
          </svg>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-end px-6 pb-20 pt-44 max-w-7xl mx-auto w-full">
          <div
            className="inline-flex items-center gap-2 bg-amber-500/15 border border-amber-500/25 text-amber-400 font-medium text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-5 w-fit"
            style={{ animation: 'fadeSlideUp 0.5s 0.1s ease both' }}
          >
            <MapPin className="w-3.5 h-3.5" /> Potskampstraat · Oldenzaal
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
            {page.hero_subtitle || 'De thuisbasis van Scouting Titus Brandsma — waar elk avontuur begint.'}
          </p>
        </div>
      </div>

      {/* ── Intro ─────────────────────────────────────────────────────────── */}
      <div className="relative bg-forest-950 px-6 py-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-6">
              Ons hart
            </div>
            <h2 className="font-display text-white text-4xl md:text-5xl font-bold uppercase leading-tight mb-6">
              Meer dan vier muren
            </h2>
            <p className="text-white/65 leading-relaxed mb-5">
              Ons clubgebouw is de thuisbasis van Scouting Titus Brandsma — een groep die al meer dan 70 jaar bestaat. Het gebouw vormt het hart van alles wat wij doen.
            </p>
            <p className="text-white/45 leading-relaxed text-sm">
              Hier komen we samen voor opkomsten, trainingen, vergaderingen en activiteiten. Een plek waar kinderen en jongeren vrienden maken en zich ontwikkelen in een veilige en vertrouwde omgeving.
            </p>
          </div>

          {/* Stacked mini photos */}
          <div className="relative h-72 md:h-80">
            {GEBOUW_FOTOS.slice(1, 4).map((src, i) => (
              <div
                key={src}
                onClick={() => setLightboxIdx(i + 1)}
                className="absolute rounded-xl overflow-hidden shadow-2xl border-2 border-forest-800 cursor-pointer hover:scale-[1.03] transition-transform duration-300"
                style={{
                  width: '65%',
                  aspectRatio: '4/3',
                  top: `${i * 20}px`,
                  left: `${i * 18}%`,
                  zIndex: i + 1,
                  transform: `rotate(${[-2, 1.5, -1][i]}deg)`,
                }}
              >
                <img src={src} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Faciliteiten ──────────────────────────────────────────────────── */}
      <div className="bg-scout-cream px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-forest-800/10 border border-forest-700/20 text-forest-700 font-medium text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-4">
              Wat je vindt
            </div>
            <h2 className="font-display text-forest-950 text-3xl md:text-4xl font-bold uppercase">Faciliteiten</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {GEBOUW_FACILITEITEN.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm group hover:-translate-y-1 transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-display text-forest-950 font-bold text-sm uppercase tracking-wide mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Foto galerij ──────────────────────────────────────────────────── */}
      <div className="bg-forest-950 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-medium text-xs tracking-widest uppercase px-4 py-2 rounded-full mb-4">
              Sfeer
            </div>
            <h2 className="font-display text-white text-3xl md:text-4xl font-bold uppercase">Bekijk het gebouw</h2>
          </div>

          {/* Mosaic grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 auto-rows-[180px]">
            {GEBOUW_FOTOS.map((src, i) => (
              <div
                key={src}
                onClick={() => setLightboxIdx(i)}
                className={`relative rounded-xl overflow-hidden cursor-pointer group
                  ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}
                  ${i === 3 ? 'md:col-span-2' : ''}
                `}
              >
                <img
                  src={src}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-forest-950/0 group-hover:bg-forest-950/25 transition-colors duration-300" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <div className="bg-forest-950 border-t border-forest-900 px-6 py-20 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-display text-white text-3xl font-bold uppercase mb-4">Kom langs!</h2>
          <p className="text-white/45 mb-8 text-sm leading-relaxed">
            Wil je ons gebouw zelf bekijken of meer weten over scouting? Kom gerust een kijkje nemen tijdens een van onze opkomsten.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 bg-scout-red hover:bg-scout-darkred text-white font-display font-semibold text-sm px-8 py-4 rounded-full tracking-widest uppercase transition-colors duration-200 group"
            >
              Neem contact op
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="/#lid-worden"
              className="inline-flex items-center gap-2 border border-white/20 hover:border-white/50 text-white/70 hover:text-white font-display font-semibold text-sm px-8 py-4 rounded-full tracking-widest uppercase transition-colors duration-200"
            >
              Lid worden
            </a>
          </div>
        </div>
      </div>

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

  if (slug === 'over-ons') {
    return <OverOnsPageLayout page={page} />;
  }

  if (slug === 'ons-gebouw') {
    return <OnsGebouwPageLayout page={page} />;
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
            className="absolute inset-0 bg-cover"
            style={{
              backgroundImage: `url(${page.hero_image})`,
              backgroundPosition: page.hero_image_position || 'center',
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
