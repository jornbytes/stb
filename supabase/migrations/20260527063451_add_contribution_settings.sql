/*
  # Add contribution settings

  1. New Settings
    - `contribution_amount`: The monthly contribution amount (e.g., "€10")
    - `contribution_description`: The description text for the contribution section
    - `contribution_subtitle`: The per maand/period subtitle

  2. Security
    - Allow anonymous users to read these settings (public information)
*/

INSERT INTO site_settings (key, value) VALUES
  ('contribution_amount', '€10'),
  ('contribution_description', 'De contributie bedraagt €10,- per maand per lid. Dit dekt kosten voor gebouw, materialen, activiteiten, kampen en verzekering. Financieel niet mogelijk? We zoeken altijd naar een oplossing.'),
  ('contribution_subtitle', 'per maand')
ON CONFLICT (key) DO NOTHING;
