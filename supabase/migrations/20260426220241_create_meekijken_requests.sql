/*
  # Meekijken aanmeldingen

  1. Nieuwe tabel: `meekijken_requests`
     - `id` (uuid, primary key)
     - `naam` (text) — naam van het kind
     - `leeftijd` (integer) — leeftijd van het kind
     - `email` (text) — e-mailadres ouder/verzorger
     - `telefoon` (text) — telefoonnummer ouder/verzorger
     - `opmerking` (text) — optionele opmerking
     - `behandeld` (boolean, default false) — verwerkt door beheerder
     - `created_at` (timestamptz, default now())

  2. Beveiliging
     - RLS ingeschakeld
     - Anonieme gebruikers mogen rijen invoegen (aanmeldformulier)
     - Ingelogde admins mogen alle rijen lezen en bijwerken
*/

CREATE TABLE IF NOT EXISTS meekijken_requests (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  naam       text NOT NULL DEFAULT '',
  leeftijd   integer,
  email      text NOT NULL DEFAULT '',
  telefoon   text NOT NULL DEFAULT '',
  opmerking  text NOT NULL DEFAULT '',
  behandeld  boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE meekijken_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit meekijken request"
  ON meekijken_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read meekijken requests"
  ON meekijken_requests FOR SELECT
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_users));

CREATE POLICY "Authenticated users can update meekijken requests"
  ON meekijken_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() IN (SELECT id FROM admin_users))
  WITH CHECK (auth.uid() IN (SELECT id FROM admin_users));
