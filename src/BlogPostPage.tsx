import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { renderBlocks } from './admin/RichEditor';
import { ArrowLeft, Menu, X, ArrowRight, Calendar, Clock } from 'lucide-react';
import AdminTopbar from './admin/AdminTopbar';

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
};

type NavItem = {
  id: string;
  label: string;
  href: string;
  open_in_new_tab: boolean;
};

const FALLBACK_LINKS: NavItem[] = [
  { id: '1', label: 'Speltakken', href: '/#speltakken', open_in_new_tab: false },
  { id: '2', label: 'Over ons',   href: '/#over-ons',   open_in_new_tab: false },
  { id: '3', label: 'Ons gebouw', href: '/#gebouw',     open_in_new_tab: false },
  { id: '4', label: 'Nieuws',     href: '/#nieuws',     open_in_new_tab: false },
  { id: '5', label: 'Contact',    href: '/#contact',    open_in_new_tab: false },
];

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
          // Prefix anchor-only hrefs with '/' since we're on a sub-page
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
              className="text-white/80 hover:text-white text-sm font-medium tracking-wide transition-colors"
            >
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

function readingTime(content: string): number {
  try {
    const blocks = JSON.parse(content);
    const text = blocks
      .map((b: { content?: string; columns?: string[] }) =>
        b.content ?? (b.columns ?? []).join(' ')
      )
      .join(' ')
      .replace(/<[^>]+>/g, '');
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  } catch {
    return 2;
  }
}

export default function BlogPostPage({ slug }: { slug: string }) {
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .maybeSingle();

      if (!data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setPost(data);

      // Load up to 2 other published posts
      const { data: others } = await supabase
        .from('blog_posts')
        .select('id, title, slug, cover_image, published_at, created_at, content')
        .eq('published', true)
        .neq('id', data.id)
        .order('published_at', { ascending: false })
        .limit(2);

      setRelated(others ?? []);
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

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="text-6xl font-bold text-gray-200">404</div>
        <h1 className="text-xl font-semibold text-gray-700">Bericht niet gevonden</h1>
        <p className="text-gray-400 text-sm max-w-sm">Dit bericht bestaat niet of is niet openbaar beschikbaar.</p>
        <a href="/" className="inline-flex items-center gap-2 mt-2 text-sm font-medium text-forest-700 hover:text-forest-900 transition">
          <ArrowLeft className="w-4 h-4" /> Terug naar home
        </a>
      </div>
    );
  }

  const publishDate = new Date(post.published_at ?? post.created_at).toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const mins = readingTime(post.content);

  return (
    <div className="min-h-screen bg-white">
      <AdminTopbar />

      {/* Hero */}
      <div className="relative bg-forest-950 overflow-hidden" style={{ height: '480px' }}>
        {post.cover_image && (
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{
              backgroundImage: `url(${post.cover_image})`,
              animation: 'heroZoom 14s ease-out forwards',
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/40 via-forest-950/55 to-forest-950/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(7,26,11,0.55)_100%)]" />

        <NavBar />

        <div className="relative z-10 h-full flex flex-col items-center justify-end text-center px-6 pb-14">
          {/* Meta */}
          <div className="flex items-center gap-4 text-white/50 text-xs mb-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {publishDate}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {mins} min. leestijd
            </span>
          </div>

          {/* Title */}
          <h1
            className="font-display font-bold text-white uppercase tracking-tight leading-none max-w-4xl"
            style={{ fontSize: 'clamp(1.8rem, 5vw, 3.5rem)' }}
          >
            {post.title}<span className="text-scout-red">.</span>
          </h1>

          {/* Decorative rule */}
          <div className="flex items-center gap-3 mt-6">
            <div className="h-px w-10 bg-scout-red/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-scout-red" />
            <div className="h-px w-10 bg-scout-red/60" />
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0 56 C360 0 1080 0 1440 56 L1440 56 L0 56 Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* Article body */}
      <div className="max-w-2xl mx-auto px-6 py-14">
        <div
          className="prose prose-base prose-gray max-w-none
            prose-headings:font-display prose-headings:uppercase prose-headings:tracking-tight
            prose-h2:text-2xl prose-h3:text-lg
            prose-blockquote:border-l-4 prose-blockquote:border-scout-red prose-blockquote:bg-forest-50 prose-blockquote:rounded-r-xl prose-blockquote:py-1
            prose-a:text-forest-700 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900"
        >
          {renderBlocks(post.content)}
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <a href="/nieuws/" className="inline-flex items-center gap-2 text-sm font-medium text-forest-700 hover:text-forest-900 transition group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Terug naar nieuws
          </a>
        </div>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <div className="bg-forest-950 py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-white text-2xl font-bold uppercase mb-8">
              Meer nieuws<span className="text-scout-red">.</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {related.map((r) => (
                <a
                  key={r.id}
                  href={`/nieuws/${r.slug}`}
                  className="group bg-forest-900 rounded-2xl overflow-hidden border border-forest-800 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  {r.cover_image && (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={r.cover_image}
                        alt={r.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="text-scout-red text-xs font-medium tracking-widest uppercase mb-2">
                      {new Date(r.published_at ?? r.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h3 className="font-display text-white text-lg font-bold uppercase leading-tight group-hover:text-scout-red transition-colors">
                      {r.title}
                    </h3>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
