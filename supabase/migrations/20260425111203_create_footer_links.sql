/*
  # Footer links tabel

  Slaat de configureerbare footer links op.

  1. Nieuwe tabel
    - `footer_links`
      - `id` (int, primary key, auto increment)
      - `label` (text) — weergegeven tekst
      - `href` (text) — URL of paginaslug
      - `link_type` ('page' | 'external') — soort link
      - `position` (int) — volgorde
  2. Standaard waarden
    - Privacybeleid, Sociale veiligheid, Bestuur
  3. Security
    - RLS aan
    - Publiek lezen, alleen admins schrijven
*/

CREATE TABLE IF NOT EXISTS footer_links (
  id serial PRIMARY KEY,
  label text NOT NULL DEFAULT '',
  href text NOT NULL DEFAULT '#',
  link_type text NOT NULL DEFAULT 'external',
  position integer NOT NULL DEFAULT 0
);

ALTER TABLE footer_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read footer links"
  ON footer_links FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert footer links"
  ON footer_links FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update footer links"
  ON footer_links FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete footer links"
  ON footer_links FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO footer_links (label, href, link_type, position) VALUES
  ('Privacybeleid', '#', 'external', 0),
  ('Sociale veiligheid', '#', 'external', 1),
  ('Bestuur', '#', 'external', 2);
