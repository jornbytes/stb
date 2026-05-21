/*
  # Formulier notificatie-abonnees

  Koppelt een formuliertype aan een website_user zodat die bij een nieuwe inzending
  een e-mailmelding ontvangt.

  1. Nieuwe tabel
     - `form_notification_subscribers`
       - `id` (uuid, primary key)
       - `form_type` (text) — 'contact' | 'meekijken' | 'membership'
       - `website_user_id` (uuid) — verwijst naar website_users.id
       - `created_at` (timestamptz)
       - UNIQUE constraint op (form_type, website_user_id)

  2. Security
     - RLS ingeschakeld
     - Alleen authenticated gebruikers mogen lezen/schrijven (admins)
*/

CREATE TABLE IF NOT EXISTS form_notification_subscribers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type       text NOT NULL CHECK (form_type IN ('contact', 'meekijken', 'membership')),
  website_user_id uuid NOT NULL REFERENCES website_users(id) ON DELETE CASCADE,
  created_at      timestamptz DEFAULT now(),
  UNIQUE (form_type, website_user_id)
);

ALTER TABLE form_notification_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read form notification subscribers"
  ON form_notification_subscribers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert form notification subscribers"
  ON form_notification_subscribers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete form notification subscribers"
  ON form_notification_subscribers
  FOR DELETE
  TO authenticated
  USING (true);
