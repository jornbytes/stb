/*
  # Voeg status toe aan membership_requests

  1. Wijzigingen
    - `membership_requests`: nieuw kolom `behandeld` (boolean, standaard false)
      - Geeft aan of een aanmelding al behandeld is door een beheerder

  2. Beveiliging
    - Ingelogde gebruikers mogen de status bijwerken
    - Ingelogde gebruikers mogen aanmeldingen verwijderen
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_requests' AND column_name = 'behandeld'
  ) THEN
    ALTER TABLE membership_requests ADD COLUMN behandeld boolean NOT NULL DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'membership_requests' AND policyname = 'Admins mogen aanvragen bijwerken'
  ) THEN
    CREATE POLICY "Admins mogen aanvragen bijwerken"
      ON membership_requests
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'membership_requests' AND policyname = 'Admins mogen aanvragen verwijderen'
  ) THEN
    CREATE POLICY "Admins mogen aanvragen verwijderen"
      ON membership_requests
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;
