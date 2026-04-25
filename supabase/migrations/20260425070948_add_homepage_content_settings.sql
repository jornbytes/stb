/*
  # Homepage Content Settings

  Inserts default homepage content keys into the existing site_settings table.
  Each key maps to an editable section of the homepage.

  ## New settings keys:
  - hero_title_1, hero_title_2, hero_title_3: Three animated headline words in the hero
  - hero_subtitle: Paragraph text beneath the hero headline
  - hero_bg_image: Background photo URL for the hero section
  - hero_stat_1_value, hero_stat_1_label: First statistic counter (default: 70+, Jaar actief)
  - hero_stat_2_value, hero_stat_2_label: Second statistic (default: 40+, Vrijwilligers)
  - hero_stat_3_value, hero_stat_3_label: Third statistic (default: 8, Speltakken)
  - over_ons_title: Heading in the Over Ons section
  - over_ons_text_1: First paragraph in Over Ons
  - over_ons_text_2: Second paragraph in Over Ons
  - over_ons_photo: Photo URL used in the Over Ons section
  - gebouw_title: Heading in the Gebouw section
  - gebouw_text: Paragraph text in the Gebouw section
  - gebouw_photo: Photo URL used in the Gebouw section
  - gebouw_adres: Address shown in Contact and Gebouw
  - gebouw_whatsapp: WhatsApp number (digits only)
  - contact_address: Address line shown in Contact
  - contact_whatsapp: WhatsApp number shown in Contact
  - contact_hours: Meeting hours line shown in Contact
  - video_youtube_id: YouTube video ID embedded in the video section
  - footer_tagline: Tagline beneath the logo in the footer (e.g. Oldenzaal · Sinds 1945)
*/

INSERT INTO site_settings (key, value) VALUES
  ('hero_title_1',        'Avontuur'),
  ('hero_title_2',        'Vriendschap'),
  ('hero_title_3',        'Groei'),
  ('hero_subtitle',       'Scouting Titus Brandsma is al meer dan 70 jaar de plek waar kinderen en jongeren uit Oldenzaal vrienden maken, de natuur ontdekken en zichzelf ontwikkelen.'),
  ('hero_bg_image',       'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1920&q=80'),
  ('hero_stat_1_value',   '70+'),
  ('hero_stat_1_label',   'Jaar actief'),
  ('hero_stat_2_value',   '40+'),
  ('hero_stat_2_label',   'Vrijwilligers'),
  ('hero_stat_3_value',   '8'),
  ('hero_stat_3_label',   'Speltakken'),
  ('over_ons_title',      'Al meer dan 70 jaar avontuur'),
  ('over_ons_text_1',     'Scouting Titus Brandsma is een scoutinggroep in het hart van Oldenzaal. Met ruim 40 actieve vrijwilligers bieden wij elke week inspirerende activiteiten voor kinderen en jongeren van 5 tot 21 jaar en ouder.'),
  ('over_ons_text_2',     'Onze roots gaan terug tot vlak na de Tweede Wereldoorlog. Door de jaren heen groeide onze groep uit tot de hechte scoutingfamilie die we vandaag de dag zijn.'),
  ('over_ons_photo',      '/jubileum_groepsfoto.jpg'),
  ('gebouw_title',        'Thuis in Oldenzaal'),
  ('gebouw_text',         'Ons clubhuis aan de Potskampstraat is het kloppende hart van de groep: meerdere ruimtes, een volwaardige keuken en een groot buitenterrein vol avontuur.'),
  ('gebouw_photo',        'https://www.scoutingtitusbrandsma.nl/wp-content/uploads/2020/07/buiten1.jpg'),
  ('contact_address',     'Potskampstraat, Oldenzaal'),
  ('contact_whatsapp',    '+31 541 363 172'),
  ('contact_hours',       'Wekelijks (tijden per speltak)'),
  ('video_youtube_id',    '7jhFlcPjLTU'),
  ('footer_tagline',      'Oldenzaal · Sinds 1945')
ON CONFLICT (key) DO NOTHING;
