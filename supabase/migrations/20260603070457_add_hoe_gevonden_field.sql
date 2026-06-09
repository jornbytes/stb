/*
  # Add "Hoe heb je ons gevonden?" field to membership and meekijken forms

  1. Changes
    - Add `hoe_gevonden` column to `membership_requests` table
    - Add `hoe_gevonden` column to `meekijken_requests` table
    
  2. Details
    - New column stores the response to "Hoe heb je ons gevonden?" (How did you find us?)
    - Options: Reuniefeest, Vriendjes, Opendag, Koningsdag, Folderactie, Haunted house, Spandoeken om Oldenzaal, Anders
    - Column is text type with default empty string
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'membership_requests' AND column_name = 'hoe_gevonden'
  ) THEN
    ALTER TABLE membership_requests ADD COLUMN hoe_gevonden text DEFAULT ''::text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meekijken_requests' AND column_name = 'hoe_gevonden'
  ) THEN
    ALTER TABLE meekijken_requests ADD COLUMN hoe_gevonden text DEFAULT ''::text;
  END IF;
END $$;
