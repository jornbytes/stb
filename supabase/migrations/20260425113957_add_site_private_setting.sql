/*
  # Privémodus instelling

  Voegt een 'site_private' sleutel toe aan site_settings.
  Waarde 'true' = site is privé (inlogscherm), 'false' = site is openbaar.
  Standaard staat de site op privé (huidige gedrag behouden).
*/

INSERT INTO site_settings (key, value)
VALUES ('site_private', 'true')
ON CONFLICT (key) DO NOTHING;
