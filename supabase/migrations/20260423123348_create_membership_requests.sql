/*
  # Lidmaatschapsaanvragen tabel

  1. Nieuwe tabel
    - `membership_requests`
      - `id` (uuid, primary key)
      - `naam` (text) - volledige naam
      - `email` (text) - e-mailadres
      - `telefoon` (text) - telefoonnummer
      - `geboortedatum` (date) - geboortedatum voor speltak-indeling
      - `speltak` (text) - gewenste speltak
      - `opmerking` (text, optioneel) - extra opmerkingen
      - `created_at` (timestamptz) - aanmelddatum

  2. Beveiliging
    - RLS ingeschakeld
    - Iedereen mag een aanvraag insturen (INSERT, geen authenticatie vereist)
    - Alleen ingelogde gebruikers mogen aanvragen lezen (voor toekomstig admin)
*/

CREATE TABLE IF NOT EXISTS membership_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  naam text NOT NULL,
  email text NOT NULL,
  telefoon text NOT NULL DEFAULT '',
  geboortedatum date,
  speltak text NOT NULL DEFAULT '',
  opmerking text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE membership_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Iedereen mag een aanvraag insturen"
  ON membership_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Alleen ingelogde gebruikers mogen aanvragen lezen"
  ON membership_requests
  FOR SELECT
  TO authenticated
  USING (true);
