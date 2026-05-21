/*
  # Add geboortedatum to meekijken_requests

  ## Changes
  - Adds `geboortedatum` (date) column to `meekijken_requests` table
  - The existing `leeftijd` (integer) column is kept for backwards compatibility

  ## Notes
  - New submissions will use geboortedatum instead of leeftijd
  - leeftijd column remains to preserve existing data
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'meekijken_requests' AND column_name = 'geboortedatum'
  ) THEN
    ALTER TABLE meekijken_requests ADD COLUMN geboortedatum date;
  END IF;
END $$;
