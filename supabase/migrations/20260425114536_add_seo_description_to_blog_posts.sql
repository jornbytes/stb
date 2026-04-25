/*
  # Voeg seo_description toe aan blog_posts

  Nieuw veld voor de meta description / OG description van nieuwsberichten.
  Wordt getoond als social media preview tekst.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'seo_description'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN seo_description text DEFAULT ''::text;
  END IF;
END $$;
