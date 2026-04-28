/*
  # Create page_views analytics table

  Tracks every page visit on the public website for analytics purposes.

  ## New Tables
  - `page_views`
    - `id` (uuid, primary key)
    - `path` (text) – URL path visited, e.g. `/`, `/speltakken`, `/nieuws/slug`
    - `page_title` (text) – Human-readable page title
    - `referrer` (text, nullable) – Where the visitor came from
    - `user_agent` (text, nullable) – Browser/device info
    - `created_at` (timestamptz) – When the visit happened
    - `session_id` (text) – Random ID per browser session (for unique visitor counting)

  ## Security
  - RLS enabled
  - Anonymous users can INSERT (to track visits)
  - Authenticated users (admins) can SELECT (to view analytics)
  - No one can UPDATE or DELETE

  ## Indexes
  - On `created_at` for date range queries
  - On `path` for per-page filtering
  - On `session_id` for unique visitor counts
*/

CREATE TABLE IF NOT EXISTS page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL DEFAULT '',
  page_title text NOT NULL DEFAULT '',
  referrer text,
  user_agent text,
  session_id text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views (path);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views (session_id);

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
  ON page_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read page views"
  ON page_views
  FOR SELECT
  TO authenticated
  USING (true);
