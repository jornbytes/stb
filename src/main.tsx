import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import AdminApp from './admin/AdminApp.tsx';
import PageView from './PageView.tsx';
import BlogPostPage from './BlogPostPage.tsx';
import './index.css';

const path = window.location.pathname;

function Root() {
  if (path.startsWith('/admin')) return <AdminApp />;

  // Blog post detail page
  const nieuzsMatch = path.match(/^\/nieuws\/(.+?)\/?$/);
  if (nieuzsMatch) return <BlogPostPage slug={nieuzsMatch[1]} />;

  // Any other non-root path → try as a page slug
  if (path !== '/' && !path.startsWith('/assets')) {
    const slug = path.replace(/^\//, '').replace(/\/$/, '');
    return <PageView slug={slug} />;
  }

  return <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>
);
