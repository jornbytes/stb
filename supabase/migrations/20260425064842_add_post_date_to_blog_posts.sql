/*
  # Add post_date to blog_posts

  Adds an optional `post_date` column to allow editors to manually set the
  display date of a news post. When left empty, the effective date falls back
  to `published_at` (and ultimately `created_at`).

  1. Changes
    - `blog_posts`: new nullable column `post_date` (date)

  2. Notes
    - No existing data is affected; null means "use published_at / created_at"
    - Sorting on the frontend uses COALESCE(post_date, published_at, created_at)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'post_date'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN post_date date DEFAULT NULL;
  END IF;
END $$;
