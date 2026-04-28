/*
  # Add hostname to page_views

  Adds a `hostname` column so dev/preview traffic (localhost, bolt.new,
  webcontainer-api.io) can be filtered out in the analytics query.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'page_views' AND column_name = 'hostname'
  ) THEN
    ALTER TABLE page_views ADD COLUMN hostname text;
  END IF;
END $$;
