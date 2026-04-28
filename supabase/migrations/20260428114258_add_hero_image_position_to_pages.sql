/*
  # Add hero_image_position to pages

  Adds a `hero_image_position` column to the `pages` table so admins can
  control the CSS background-position of the hero image per page.

  New column:
    - `hero_image_position` (text) — CSS background-position value
      e.g. "center", "top", "bottom", "center top", "50% 25%"
      Defaults to "center" (existing behaviour).
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pages' AND column_name = 'hero_image_position'
  ) THEN
    ALTER TABLE pages ADD COLUMN hero_image_position text NOT NULL DEFAULT 'center';
  END IF;
END $$;
