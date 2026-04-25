import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SITE_NAME = 'Scouting Titus Brandsma Oldenzaal';
const DEFAULT_IMAGE = '/logo-transparant-150.png';

function escapeHtml(str) {
  return (str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function extractTextFromBlocks(content) {
  try {
    const blocks = JSON.parse(content);
    return blocks
      .map((b) => (b.content ?? (b.columns ?? []).join(' ')))
      .join(' ')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return '';
  }
}

function buildOgTags({ title, description, image, url }) {
  const fullTitle = title ? `${escapeHtml(title)} | ${SITE_NAME}` : SITE_NAME;
  const desc = escapeHtml((description || '').slice(0, 160));
  const img = image || DEFAULT_IMAGE;

  return `
    <title>${fullTitle}</title>
    <meta name="description" content="${desc}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:title" content="${fullTitle}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="${escapeHtml(img)}" />
    ${url ? `<meta property="og:url" content="${escapeHtml(url)}" />` : ''}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${fullTitle}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${escapeHtml(img)}" />`;
}

function injectTags(html, tags) {
  return html.replace('</head>', `${tags}\n  </head>`);
}

app.use(express.static(path.join(__dirname, 'dist')));

// Blog post pages
app.get('/nieuws/:slug', async (req, res) => {
  const htmlPath = path.join(__dirname, 'dist', 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf-8');

  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, cover_image, seo_description, content')
    .eq('slug', req.params.slug)
    .eq('published', true)
    .maybeSingle();

  if (post) {
    const description = post.seo_description ||
      extractTextFromBlocks(post.content).slice(0, 160);
    const tags = buildOgTags({
      title: post.title,
      description,
      image: post.cover_image || null,
      url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
    });
    html = injectTags(html, tags);
  }

  res.send(html);
});

// Regular pages
app.get('/:slug', async (req, res, next) => {
  const slug = req.params.slug;

  // Skip admin, assets, etc.
  if (slug.startsWith('admin') || slug.includes('.')) return next();

  const htmlPath = path.join(__dirname, 'dist', 'index.html');
  let html = fs.readFileSync(htmlPath, 'utf-8');

  const { data: page } = await supabase
    .from('pages')
    .select('title, hero_image, seo_title, seo_description, hero_subtitle, content')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (page) {
    const title = page.seo_title || page.title;
    const description = page.seo_description ||
      page.hero_subtitle ||
      extractTextFromBlocks(page.content).slice(0, 160);
    const tags = buildOgTags({
      title,
      description,
      image: page.hero_image || null,
      url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
    });
    html = injectTags(html, tags);
  }

  res.send(html);
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});
