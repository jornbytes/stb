import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { ArrowRight, Menu, X, Calendar, Clock, Search } from 'lucide-react';
import AdminTopbar from './admin/AdminTopbar';

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string;
  published_at: string | null;
  post_date: string | null;
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
  { id: '4', label: 'Nieuws',     href: '/nieuws/',     open_in_new_tab: false },
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

function excerpt(content: string, maxLen = 120): string {
  try {
    const blocks = JSON.parse(content);
    const text = blocks
      .map((b: { content?: string; columns?: string[] }) =>
        b.content ?? (b.columns ?? []).join(' ')
      )
      .join(' ')
      .replace(/<[^>]+>/g, '')
      .trim();
    return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + '…' : text;
  } catch {
    return '';
  }
}

function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  const date = new Date(post.post_date ?? post.published_at ?? post.created_at).toLocaleDateString('nl-NL', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const mins = readingTime(post.content);
  const blurb = excerpt(post.content, featured ? 180 : 100);

  if (featured) {
    return (
      <a
        href={`/nieuws/${post.slug}`}
        className="group relative block rounded-3xl overflow-hidden bg-forest-950 shadow-2xl border border-forest-800 hover:shadow-forest-900/60 hover:-translate-y-1 transition-all duration-300"
        style={{ minHeight: '420px' }}
      >
        {post.cover_image ? (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
              style={{ backgroundImage: `url(${post.cover_image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/70 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-forest-800 to-forest-950" />
        )}

        <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
          <div className="flex items-center gap-3 mb-4 text-white/50 text-xs">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {date}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {mins} min.
            </span>
          </div>
          <h2 className="font-display font-bold text-white uppercase tracking-tight leading-none mb-3 group-hover:text-scout-red transition-colors duration-200" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)' }}>
            {post.title}<span className="text-scout-red">.</span>
          </h2>
          {blurb && (
            <p className="text-white/60 text-sm leading-relaxed max-w-2xl line-clamp-2">{blurb}</p>
          )}
          <div className="mt-5 inline-flex items-center gap-2 text-scout-red text-sm font-semibold tracking-wide group-hover:gap-3 transition-all duration-200">
            Lees meer <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={`/nieuws/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {post.cover_image ? (
        <div className="h-48 overflow-hidden bg-forest-100">
          <img
            src={post.cover_image}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => ((e.target as HTMLImageElement).parentElement!.style.display = 'none')}
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-forest-100 to-forest-200 flex items-center justify-center">
          <span className="font-display text-forest-400 text-4xl font-bold uppercase tracking-widest opacity-40">
            {post.title.slice(0, 1)}
          </span>
        </div>
      )}
      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center gap-3 mb-3 text-gray-400 text-xs">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" /> {date}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> {mins} min.
          </span>
        </div>
        <h3 className="font-display font-bold text-forest-950 uppercase tracking-tight text-lg leading-tight mb-2 group-hover:text-scout-red transition-colors duration-200">
          {post.title}
        </h3>
        {blurb && (
          <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1">{blurb}</p>
        )}
        <div className="mt-4 inline-flex items-center gap-1.5 text-forest-700 text-xs font-semibold tracking-wide group-hover:gap-2.5 transition-all duration-200">
          Lees meer <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </a>
  );
}

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('id, title, slug, content, cover_image, published_at, post_date, created_at')
      .eq('published', true)
      .then(({ data }) => {
        const effectiveDate = (p: typeof data[0]) => {
          const raw = p.post_date ?? p.published_at ?? p.created_at;
          // Normalise: date-only strings like "2026-03-30" get appended with time
          // so they compare correctly against full ISO timestamps.
          return new Date(raw.length === 10 ? raw + 'T00:00:00' : raw).getTime();
        };
        const sorted = (data ?? []).sort((a, b) => effectiveDate(b) - effectiveDate(a));
        setPosts(sorted);
        setLoading(false);
      });
  }, []);

  const filtered = query.trim()
    ? posts.filter(p => p.title.toLowerCase().includes(query.toLowerCase()))
    : posts;

  const [featured, ...rest] = filtered;

  return (
    <div className="min-h-screen bg-scout-cream">
      <AdminTopbar />

      {/* Hero header */}
      <div className="relative bg-forest-950 overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <NavBar />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-36 pb-20 text-center">
          <div className="inline-flex items-center gap-2 mb-5">
            <div className="h-px w-8 bg-scout-red/60" />
            <span className="text-scout-red text-xs font-semibold tracking-[0.2em] uppercase">Scouting Titus Brandsma</span>
            <div className="h-px w-8 bg-scout-red/60" />
          </div>
          <h1
            className="font-display font-bold text-white uppercase tracking-tight leading-none"
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)' }}
          >
            Nieuws<span className="text-scout-red">.</span>
          </h1>
          <p className="text-white/50 mt-5 text-base max-w-lg mx-auto leading-relaxed">
            Ontdek de laatste verhalen, activiteiten en avonturen van onze scoutinggroep.
          </p>
        </div>

        {/* Wave */}
        <div style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 56" style={{ display: 'block', width: '100%' }} preserveAspectRatio="none">
            <path
              d="M0,56 L0,30 C80,30 100,8 140,8 C180,8 196,36 240,36 C284,36 300,12 344,12 C388,12 404,40 448,40 C492,40 508,14 552,14 C596,14 612,42 656,42 C700,42 716,10 760,10 C804,10 820,38 864,38 C908,38 924,14 968,14 C1012,14 1028,42 1072,42 C1116,42 1132,16 1176,16 C1220,16 1236,44 1280,44 C1324,44 1340,18 1384,18 C1410,18 1428,32 1440,32 L1440,56 Z"
              fill="#faf8f0"
            />
          </svg>
        </div>
      </div>

      {/* Search bar */}
      <div className="max-w-7xl mx-auto px-6 -mt-4 mb-12">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Zoek een bericht..."
            className="w-full pl-11 pr-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-200 transition"
          />
        </div>
      </div>

      {/* Posts */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-7 h-7 border-2 border-forest-300 border-t-forest-700 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-gray-400 text-lg font-display uppercase tracking-wide">Geen berichten gevonden</p>
            {query && (
              <button onClick={() => setQuery('')} className="mt-4 text-sm text-forest-700 hover:underline">
                Wis zoekopdracht
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Featured post */}
            {featured && !query && (
              <div className="mb-10">
                <PostCard post={featured} featured />
              </div>
            )}

            {/* Grid */}
            {(query ? filtered : rest).length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {(query ? filtered : rest).map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
