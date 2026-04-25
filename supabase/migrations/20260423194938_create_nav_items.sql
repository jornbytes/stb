/*
  # Navigatiemenu items tabel

  1. Nieuwe tabel
    - `nav_items`
      - `id` (uuid, primary key)
      - `label` (text) - zichtbare tekst in de navigatie
      - `type` (text) - 'page' of 'external'
      - `page_id` (uuid, nullable) - verwijzing naar een pagina
      - `href` (text, nullable) - externe URL of ankerpunt (#section)
      - `position` (integer) - sorteervolgorde
      - `open_in_new_tab` (boolean) - externe links in nieuw tabblad
      - `created_at` (timestamptz)

  2. Beveiliging
    - RLS ingeschakeld
    - Iedereen mag nav items lezen (nodig voor de publieke navigatie)
    - Alleen ingelogde beheerders mogen items aanmaken, wijzigen of verwijderen

  3. Standaarddata
    - De huidige vaste navigatielinks worden als startpunt ingevoegd
*/

CREATE TABLE IF NOT EXISTS nav_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'external' CHECK (type IN ('page', 'external')),
  page_id uuid REFERENCES pages(id) ON DELETE SET NULL,
  href text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  open_in_new_tab boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE nav_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Iedereen mag nav items lezen"
  ON nav_items
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins mogen nav items aanmaken"
  ON nav_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins mogen nav items bijwerken"
  ON nav_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins mogen nav items verwijderen"
  ON nav_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Standaard navigatie op basis van de huidige vaste links
INSERT INTO nav_items (label, type, href, position, open_in_new_tab) VALUES
  ('Speltakken',  'external', '#speltakken', 0, false),
  ('Over ons',    'external', '#over-ons',   1, false),
  ('Ons gebouw',  'external', '#gebouw',     2, false),
  ('Bekijk ons',  'external', '#video',      3, false),
  ('Nieuws',      'external', '#nieuws',     4, false),
  ('Contact',     'external', '#contact',    5, false);
