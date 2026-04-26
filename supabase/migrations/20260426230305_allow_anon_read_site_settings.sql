/*
  # Allow anonymous users to read site_settings

  The public homepage reads speltak names, descriptions, and other display
  content from site_settings. Without this policy, anonymous visitors get an
  empty response and see hardcoded fallback values instead of the real data.

  1. Changes
    - Add SELECT policy for anon role on site_settings (all rows)
*/

CREATE POLICY "Anyone can read site settings"
  ON site_settings
  FOR SELECT
  TO anon
  USING (true);
