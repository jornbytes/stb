import { StrictMode, useEffect, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import AdminApp from './admin/AdminApp.tsx';
import PageView from './PageView.tsx';
import BlogPostPage from './BlogPostPage.tsx';
import NewsPage from './NewsPage.tsx';
import ContactPage from './ContactPage.tsx';
import MeekijkenPage from './MeekijkenPage.tsx';
import './index.css';
import { supabase } from './lib/supabase.ts';

const path = window.location.pathname;

function getSessionId(): string {
  const key = 'pv_sid';
  let sid = sessionStorage.getItem(key);
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem(key, sid);
  }
  return sid;
}

function trackPageView(title: string) {
  supabase.from('page_views').insert({
    path,
    page_title: title,
    referrer: document.referrer || null,
    user_agent: navigator.userAgent || null,
    session_id: getSessionId(),
  });
}

function Tracked({ title, children }: { title: string; children: ReactNode }) {
  useEffect(() => { trackPageView(title); }, [title]);
  return <>{children}</>;
}

function PublicSite() {
  // News overview page
  if (path === '/nieuws' || path === '/nieuws/') {
    return <Tracked title="Nieuws"><NewsPage /></Tracked>;
  }

  // Blog post detail page
  const nieuwsMatch = path.match(/^\/nieuws\/(.+?)\/?$/);
  if (nieuwsMatch) {
    return <Tracked title={`Nieuwsbericht: ${nieuwsMatch[1]}`}><BlogPostPage slug={nieuwsMatch[1]} /></Tracked>;
  }

  // Contact page
  if (path === '/contact' || path === '/contact/') {
    return <Tracked title="Contact"><ContactPage /></Tracked>;
  }

  // Meekijken page (dedicated with signup form)
  if (path === '/meekijken' || path === '/meekijken/') {
    return <Tracked title="Meekijken"><MeekijkenPage /></Tracked>;
  }

  // Any other non-root path → try as a page slug
  if (path !== '/' && !path.startsWith('/assets')) {
    const slug = path.replace(/^\//, '').replace(/\/$/, '');
    return <Tracked title={slug}><PageView slug={slug} /></Tracked>;
  }

  return <Tracked title="Homepage"><App /></Tracked>;
}

function Root() {
  if (path.startsWith('/admin')) return <AdminApp />;

  return <PublicSite />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
