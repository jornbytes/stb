/*
  # Sta anonieme gebruikers toe de site_private instelling te lezen

  Zonder deze policy kunnen anonieme bezoekers site_settings niet lezen,
  waardoor isSitePrivate() altijd null teruggeeft en de site altijd
  als privé wordt beschouwd — ook als de instelling op 'false' staat.

  Deze policy geeft alleen leestoegang tot de 'site_private' rij.
*/

CREATE POLICY "Anyone can read site_private setting"
  ON site_settings FOR SELECT
  TO anon
  USING (key = 'site_private');
