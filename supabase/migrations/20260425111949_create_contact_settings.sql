/*
  # Contact pagina instellingen

  Slaat alle configureerbare velden voor de contactpagina op in site_settings.

  1. Nieuwe keys in site_settings
    - contact_title            — Paginatitel in de hero
    - contact_subtitle         — Hero ondertitel
    - contact_hero_image       — Hero achtergrondafbeelding URL
    - contact_intro            — Inleidende tekst naast het formulier
    - contact_address          — Fysiek adres
    - contact_whatsapp         — WhatsApp-nummer (weergave)
    - contact_hours            — Openingstijden / bijeenkomstmomenten
    - contact_email            — E-mailadres
    - contact_maps_url         — Google Maps iframe src
    - contact_form_title       — Titel boven het formulier
    - contact_form_button      — Knoptekst van het formulier
    - contact_form_fields      — JSON array met veldconfiguratie

  2. Standaardwaarden worden ingevoerd
*/

INSERT INTO site_settings (key, value) VALUES
  ('contact_title',        'Contact'),
  ('contact_subtitle',     'Heb je een vraag, wil je meer informatie of wil je gewoon langskomen? We staan voor je klaar.'),
  ('contact_hero_image',   ''),
  ('contact_intro',        'Neem gerust contact met ons op. Of je nu vragen hebt over lid worden, onze activiteiten of ons gebouw – we helpen je graag verder.'),
  ('contact_address',      'Potskampstraat, Oldenzaal'),
  ('contact_whatsapp',     '+31 541 363 172'),
  ('contact_hours',        'Wekelijks (tijden per speltak)'),
  ('contact_email',        ''),
  ('contact_maps_url',     ''),
  ('contact_form_title',   'Stuur een bericht'),
  ('contact_form_button',  'Verstuur bericht'),
  ('contact_form_fields',  '[{"key":"naam","label":"Naam","type":"text","placeholder":"Jouw naam","required":true},{"key":"email","label":"E-mail","type":"email","placeholder":"jouw@email.nl","required":true},{"key":"onderwerp","label":"Onderwerp","type":"text","placeholder":"Waar gaat jouw vraag over?","required":false},{"key":"bericht","label":"Bericht","type":"textarea","placeholder":"Schrijf hier jouw bericht...","required":true}]')
ON CONFLICT (key) DO NOTHING;
