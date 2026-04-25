/*
  # Admin CMS Tables

  Creates all tables needed for the admin panel:

  1. New Tables
    - `admin_users` — tracks which auth users are admins and if they must change password
    - `blog_posts` — blog articles with title, slug, content, cover image, published state
    - `pages` — custom pages with title, slug, hero image/subtitle, rich content, published state
    - `site_texts` — key/value store for editable site-wide text snippets

  2. Security
    - RLS enabled on all tables
    - Only authenticated admin users can read/write their own data
    - `admin_users` is readable by self only
    - `blog_posts`, `pages`, `site_texts` are readable by authenticated admins, public can read published content
*/

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  must_change_password boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can read own record"
  ON admin_users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin can update own record"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  slug text UNIQUE NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  cover_image text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  author_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can select blog posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Public can read published blog posts"
  ON blog_posts FOR SELECT
  TO anon
  USING (published = true);

CREATE POLICY "Admin can insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Admin can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Admin can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

-- Pages table
CREATE TABLE IF NOT EXISTS pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  slug text UNIQUE NOT NULL DEFAULT '',
  hero_subtitle text NOT NULL DEFAULT '',
  hero_image text NOT NULL DEFAULT '',
  content text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT false,
  author_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can select pages"
  ON pages FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Public can read published pages"
  ON pages FOR SELECT
  TO anon
  USING (published = true);

CREATE POLICY "Admin can insert pages"
  ON pages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Admin can update pages"
  ON pages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Admin can delete pages"
  ON pages FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

-- Site texts table
CREATE TABLE IF NOT EXISTS site_texts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label text NOT NULL DEFAULT '',
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_texts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can select site texts"
  ON site_texts FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Public can read site texts"
  ON site_texts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admin can insert site texts"
  ON site_texts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Admin can update site texts"
  ON site_texts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Admin can delete site texts"
  ON site_texts FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

-- Seed default site texts
INSERT INTO site_texts (key, label, value) VALUES
  ('hero_title_1', 'Hero — Eerste woord', 'Avontuur'),
  ('hero_title_2', 'Hero — Tweede woord', 'Vriendschap'),
  ('hero_title_3', 'Hero — Derde woord', 'Groei'),
  ('hero_subtitle', 'Hero — Ondertitel', 'Scouting Titus Brandsma is al meer dan 70 jaar de plek waar kinderen en jongeren uit Oldenzaal vrienden maken, de natuur ontdekken en zichzelf ontwikkelen.'),
  ('over_ons_intro', 'Over ons — Intro', 'Scouting Titus Brandsma is een scoutinggroep in het hart van Oldenzaal. Met ruim 40 actieve vrijwilligers bieden wij elke week inspirerende activiteiten voor kinderen en jongeren van 5 tot 21 jaar en ouder.'),
  ('contact_adres', 'Contact — Adres', 'Potskampstraat, Oldenzaal'),
  ('contact_whatsapp', 'Contact — WhatsApp', '+31 541 363 172')
ON CONFLICT (key) DO NOTHING;
