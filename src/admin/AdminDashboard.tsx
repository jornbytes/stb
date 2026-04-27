import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  Type,
  LogOut,
  Menu,
  X,
  Inbox,
  ExternalLink,
  ChevronRight,
  Users,
  Image,
  Navigation,
  Settings as SettingsIcon,
  MessageCircle,
} from 'lucide-react';
import BlogPosts from './BlogPosts';
import Pages from './Pages';
import Submissions from './Submissions';
import MediaLibrary from './MediaLibrary';
import WebsiteUsers from './WebsiteUsers';
import NavMenu from './NavMenu';
import Settings from './Settings';
import HomepageEditor from './HomepageEditor';
import ContactEditor from './ContactEditor';
import ContactSubmissions from './ContactSubmissions';
import MeekijkenSubmissions from './MeekijkenSubmissions';

type Section = 'overview' | 'blog' | 'pages' | 'submissions' | 'media' | 'users' | 'nav' | 'settings' | 'homepage' | 'contact' | 'contact-messages' | 'meekijken';

const nav: { id: Section; label: string; icon: React.ReactNode; desc: string; group?: string }[] = [
  { id: 'overview', label: 'Overzicht', icon: <LayoutDashboard className="w-4 h-4" />, desc: 'Dashboard' },
  { id: 'submissions', label: 'Aanmeldingen', icon: <Inbox className="w-4 h-4" />, desc: 'Formulier inzendingen' },
  { id: 'meekijken', label: 'Meekijken', icon: <Inbox className="w-4 h-4" />, desc: 'Aanmeldingen via meekijken-formulier' },
  { id: 'contact-messages', label: 'Contactberichten', icon: <MessageCircle className="w-4 h-4" />, desc: 'Berichten via contactformulier' },
  { id: 'homepage', label: 'Homepagina', icon: <Type className="w-4 h-4" />, desc: 'Teksten & foto\'s homepagina', group: 'Inhoud' },
  { id: 'contact', label: 'Contactpagina', icon: <MessageCircle className="w-4 h-4" />, desc: 'Contactgegevens & formulier', group: 'Inhoud' },
  { id: 'nav', label: 'Menu', icon: <Navigation className="w-4 h-4" />, desc: 'Navigatie aanpassen', group: 'Inhoud' },
  { id: 'pages', label: "Pagina's", icon: <FileText className="w-4 h-4" />, desc: "Pagina's beheren", group: 'Inhoud' },
  { id: 'blog', label: 'Blogberichten', icon: <Newspaper className="w-4 h-4" />, desc: 'Nieuws schrijven', group: 'Inhoud' },

  { id: 'media', label: 'Mediabibliotheek', icon: <Image className="w-4 h-4" />, desc: 'Uploads beheren', group: 'Beheer' },
  { id: 'users', label: 'Gebruikers', icon: <Users className="w-4 h-4" />, desc: 'Accounts & rechten', group: 'Beheer' },
  { id: 'settings', label: 'Instellingen', icon: <SettingsIcon className="w-4 h-4" />, desc: 'API-sleutels & configuratie', group: 'Beheer' },
];

export default function AdminDashboard() {
  const [section, setSection] = useState<Section>('overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [submissionCount, setSubmissionCount] = useState<number | null>(null);
  const [contactMessageCount, setContactMessageCount] = useState<number | null>(null);
  const [meekijkenCount, setMeekijkenCount] = useState<number | null>(null);

  useEffect(() => {
    supabase.from('membership_requests').select('id', { count: 'exact', head: true })
      .then(({ count }) => setSubmissionCount(count ?? 0));
    supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('behandeld', false)
      .then(({ count }) => setContactMessageCount(count ?? 0));
    supabase.from('meekijken_requests').select('id', { count: 'exact', head: true }).eq('behandeld', false)
      .then(({ count }) => setMeekijkenCount(count ?? 0));
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  const current = nav.find((n) => n.id === section)!;

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-forest-950 flex flex-col transform transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <img src="/logo-transparant-150.png" alt="Logo" className="h-8 w-auto" />
          <div>
            <div className="text-white text-sm font-bold leading-tight tracking-wide">Scouting TB</div>
            <div className="text-white/40 text-[10px] leading-none mt-0.5 uppercase tracking-wider">Admin panel</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {/* No-group items first */}
          <div className="space-y-0.5 mb-4">
            {nav.filter((n) => !n.group).map((item) => {
              const active = section === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setSection(item.id); setMobileOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative
                    ${active ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/8 hover:text-white/80'}`}
                >
                  <span className={active ? 'text-white' : 'text-white/40 group-hover:text-white/60 transition'}>{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.id === 'submissions' && submissionCount !== null && submissionCount > 0 && (
                    <span className="bg-scout-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{submissionCount}</span>
                  )}
                  {item.id === 'contact-messages' && contactMessageCount !== null && contactMessageCount > 0 && (
                    <span className="bg-scout-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{contactMessageCount}</span>
                  )}
                  {item.id === 'meekijken' && meekijkenCount !== null && meekijkenCount > 0 && (
                    <span className="bg-scout-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{meekijkenCount}</span>
                  )}
                  {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white/60 rounded-r-full" />}
                </button>
              );
            })}
          </div>

          {/* Grouped items */}
          {['Inhoud', 'Beheer'].map((group) => (
            <div key={group} className="mb-4">
              <div className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/25">{group}</div>
              <div className="space-y-0.5">
                {nav.filter((n) => n.group === group).map((item) => {
                  const active = section === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setSection(item.id); setMobileOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative
                        ${active ? 'bg-white/15 text-white' : 'text-white/50 hover:bg-white/8 hover:text-white/80'}`}
                    >
                      <span className={active ? 'text-white' : 'text-white/40 group-hover:text-white/60 transition'}>{item.icon}</span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-white/60 rounded-r-full" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom links */}
        <div className="px-3 py-4 border-t border-white/10 space-y-0.5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-white/8 hover:text-white/80 transition group"
          >
            <ExternalLink className="w-4 h-4 text-white/40 group-hover:text-white/60 transition" />
            Website bekijken
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:bg-red-500/20 hover:text-red-300 transition group"
          >
            <LogOut className="w-4 h-4 text-white/40 group-hover:text-red-300 transition" />
            Uitloggen
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-gray-500 hover:text-gray-900 p-1" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">{current.label}</h1>
              <p className="text-xs text-gray-400 hidden sm:block">{current.desc}</p>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {section === 'overview' && <Overview onNavigate={setSection} submissionCount={submissionCount} />}
          {section === 'homepage' && <HomepageEditor />}
          {section === 'contact' && <ContactEditor />}
          {section === 'contact-messages' && <ContactSubmissions />}
          {section === 'meekijken' && <MeekijkenSubmissions />}
          {section === 'blog' && <BlogPosts />}
          {section === 'pages' && <Pages />}
          {section === 'submissions' && <Submissions />}
          {section === 'media' && <MediaLibrary />}
          {section === 'users' && <WebsiteUsers />}
          {section === 'nav' && <NavMenu />}
          {section === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center shrink-0`}>{icon}</div>
      <div>
        <div className="text-2xl font-bold text-gray-900 leading-none">{value}</div>
        <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, desc, onClick, badge }: { icon: React.ReactNode; label: string; desc: string; onClick: () => void; badge?: number }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-2xl border border-gray-100 p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group shadow-sm relative"
    >
      {badge != null && badge > 0 && (
        <span className="absolute top-3 right-3 bg-scout-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <div className="mb-3">{icon}</div>
      <div className="font-semibold text-gray-900 text-sm mb-0.5">{label}</div>
      <div className="text-xs text-gray-400">{desc}</div>
      <ChevronRight className="w-4 h-4 text-gray-300 mt-3 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
    </button>
  );
}

function Overview({ onNavigate, submissionCount }: { onNavigate: (s: Section) => void; submissionCount: number | null }) {
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [postCount, setPostCount] = useState<number | null>(null);

  useEffect(() => {
    supabase.from('pages').select('id', { count: 'exact', head: true }).then(({ count }) => setPageCount(count ?? 0));
    supabase.from('blog_posts').select('id', { count: 'exact', head: true }).then(({ count }) => setPostCount(count ?? 0));
  }, []);

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-0.5">Welkom terug</h2>
        <p className="text-sm text-gray-400">Beheer de website van Scouting Titus Brandsma</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<Inbox className="w-5 h-5 text-scout-red" />}
          label="Aanmeldingen"
          value={submissionCount ?? 0}
          color="bg-red-50"
        />
        <StatCard
          icon={<FileText className="w-5 h-5 text-forest-600" />}
          label="Pagina's"
          value={pageCount ?? 0}
          color="bg-green-50"
        />
        <StatCard
          icon={<Newspaper className="w-5 h-5 text-blue-600" />}
          label="Blogberichten"
          value={postCount ?? 0}
          color="bg-blue-50"
        />
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Snelle acties</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            icon={<Inbox className="w-6 h-6 text-scout-red" />}
            label="Aanmeldingen"
            desc="Bekijk ingediende formulieren"
            onClick={() => onNavigate('submissions')}
            badge={submissionCount ?? undefined}
          />
          <QuickAction
            icon={<FileText className="w-6 h-6 text-forest-600" />}
            label="Nieuwe pagina"
            desc="Maak een pagina aan"
            onClick={() => onNavigate('pages')}
          />
          <QuickAction
            icon={<Newspaper className="w-6 h-6 text-blue-600" />}
            label="Nieuw bericht"
            desc="Schrijf een nieuwsbericht"
            onClick={() => onNavigate('blog')}
          />
          <QuickAction
            icon={<Type className="w-6 h-6 text-amber-600" />}
            label="Homepage teksten"
            desc="Pas teksten op de homepage aan"
            onClick={() => onNavigate('texts')}
          />
        </div>
      </div>
    </div>
  );
}
