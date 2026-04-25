/*
  # Site Settings tabel

  Slaat globale app-instellingen op als key-value paren.
  Alleen admins (authenticated users) kunnen lezen en schrijven.

  1. Nieuwe tabel
     - `site_settings` (key text PK, value text, updated_at timestamptz)
  2. Standaard rij voor Pexels API-sleutel
  3. RLS: alleen authenticated users
*/

CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read settings"
  ON site_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO site_settings (key, value) VALUES ('pexels_api_key', '')
  ON CONFLICT (key) DO NOTHING;
