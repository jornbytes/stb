/*
  # Add SEO and visibility fields to pages

  1. Changes to `pages` table
    - `visibility` (text): 'public' | 'private' | 'password' — default 'public'
    - `password` (text): optional access password for password-protected pages
    - `seo_title` (text): custom SEO meta title
    - `seo_description` (text): custom SEO meta description
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pages' AND column_name = 'visibility'
  ) THEN
    ALTER TABLE pages ADD COLUMN visibility text NOT NULL DEFAULT 'public';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pages' AND column_name = 'password'
  ) THEN
    ALTER TABLE pages ADD COLUMN password text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pages' AND column_name = 'seo_title'
  ) THEN
    ALTER TABLE pages ADD COLUMN seo_title text NOT NULL DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pages' AND column_name = 'seo_description'
  ) THEN
    ALTER TABLE pages ADD COLUMN seo_description text NOT NULL DEFAULT '';
  END IF;
END $$;
