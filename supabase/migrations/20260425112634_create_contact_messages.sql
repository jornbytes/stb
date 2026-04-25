/*
  # Contact berichten tabel

  Slaat berichten op die via het contactformulier op /contact worden ingediend.

  1. Nieuwe tabel
    - `contact_messages`
      - `id` (uuid, primary key)
      - `fields` (jsonb) — alle ingevulde veldwaarden als key/value
      - `behandeld` (boolean) — of het bericht al afgehandeld is
      - `created_at` (timestamptz)

  2. Security
    - RLS aan
    - Anonieme gebruikers mogen INSERT (formulier is publiek)
    - Ingelogde admins mogen alles lezen, updaten en verwijderen
*/

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fields jsonb NOT NULL DEFAULT '{}',
  behandeld boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit contact message"
  ON contact_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can read contact messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update contact messages"
  ON contact_messages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contact messages"
  ON contact_messages FOR DELETE
  TO authenticated
  USING (true);
