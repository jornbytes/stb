import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { renderBlocks } from './admin/RichEditor';
import { ArrowLeft, Lock, Menu, X, ArrowRight } from 'lucide-react';
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '/#speltakken', label: 'Speltakken' },
    { href: '/#over-ons', label: 'Over ons' },
    { href: '/#gebouw', label: 'Ons gebouw' },
    { href: '/#nieuws', label: 'Nieuws' },
    { href: '/#contact', label: 'Contact' },
  ];

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
            <a key={l.href} href={l.href} className="text-white/80 hover:text-white text-sm font-medium tracking-wide transition-colors">
              {l.label}
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
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-white/80 hover:text-white font-medium py-1 transition-colors">
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

function Footer() {
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
            {['Privacybeleid', 'Sociale veiligheid', 'Bestuur'].map((l) => (
              <a key={l} href="#" className="text-white/35 hover:text-white/70 text-xs tracking-wide transition-colors">{l}</a>
            ))}
          </div>
          <p className="text-white/20 text-xs">© {new Date().getFullYear()} Alle rechten voorbehouden</p>
        </div>
        <div className="mt-6 pt-5 border-t border-forest-900" />
      </div>
    </footer>
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

  return (
    <div className="min-h-screen bg-white">
      <AdminTopbar pageSlug={slug} />
      <title>{page.seo_title || page.title}</title>

      <NavBar />

      {/* ── Adventure Hero ───────────────────────────────────────────────────── */}
      <div className="relative bg-forest-950 overflow-hidden flex flex-col" style={{ height: '320px' }}>

        {/* Background image with slight zoom */}
        {page.hero_image ? (
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{
              backgroundImage: `url(${page.hero_image})`,
              animation: 'heroZoom 14s ease-out forwards',
            }}
          />
        ) : (
          /* Textured dark background when no image */
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(46,101,55,0.35),transparent)]" />
        )}

        {/* Dark overlay — heavier at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/55 via-forest-950/50 to-forest-950/95" />

        {/* Subtle side vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(7,26,11,0.55)_100%)]" />

        {/* Diagonal accent stripe */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-24 top-0 bottom-0 w-1.5 bg-scout-red/30 rotate-[12deg] origin-top-left" />
          <div className="absolute -left-16 top-0 bottom-0 w-px bg-white/8 rotate-[12deg] origin-top-left" />
        </div>

        {/* Grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            backgroundSize: '200px 200px',
          }}
        />

        {/* Content — vertically centered, pushed down for navbar */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-20 pb-8">

          {/* Scout badge / breadcrumb */}
          <div className="inline-flex items-center gap-2 mb-6">
            <a href="/" className="text-white/40 hover:text-white/70 text-xs font-medium tracking-widest uppercase transition">Home</a>
            <span className="text-white/20 text-xs">/</span>
            <span className="text-scout-red text-xs font-semibold tracking-widest uppercase">{page.title}</span>
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-white uppercase tracking-tight leading-none mb-5"
            style={{ fontSize: 'clamp(2rem, 6vw, 3.8rem)' }}>
            {page.title}
            <span className="text-scout-red">.</span>
          </h1>

          {/* Subtitle */}
          {page.hero_subtitle && (
            <p className="text-white/65 text-base md:text-lg max-w-xl leading-relaxed">
              {page.hero_subtitle}
            </p>
          )}

          {/* Decorative horizontal rule */}
          <div className="flex items-center gap-3 mt-8">
            <div className="h-px w-10 bg-scout-red/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-scout-red" />
            <div className="h-px w-10 bg-scout-red/60" />
          </div>
        </div>

        {/* Bottom wave transition */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0 56 C360 0 1080 0 1440 56 L1440 56 L0 56 Z" fill="white" />
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
