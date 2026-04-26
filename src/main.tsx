import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import AdminApp from './admin/AdminApp.tsx';
import PageView from './PageView.tsx';
import BlogPostPage from './BlogPostPage.tsx';
import NewsPage from './NewsPage.tsx';
import ContactPage from './ContactPage.tsx';
import './index.css';

const path = window.location.pathname;

function PublicSite() {
  // News overview page
  if (path === '/nieuws' || path === '/nieuws/') return <NewsPage />;

  // Blog post detail page
  const nieuwsMatch = path.match(/^\/nieuws\/(.+?)\/?$/);
  if (nieuwsMatch) return <BlogPostPage slug={nieuwsMatch[1]} />;

  // Contact page
  if (path === '/contact' || path === '/contact/') return <ContactPage />;

  // Any other non-root path → try as a page slug
  if (path !== '/' && !path.startsWith('/assets')) {
    const slug = path.replace(/^\//, '').replace(/\/$/, '');
    return <PageView slug={slug} />;
  }

  return <App />;
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
