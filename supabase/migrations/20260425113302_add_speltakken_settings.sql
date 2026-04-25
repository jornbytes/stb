/*
  # Speltakken instellingen

  Voegt per speltak configureerbare velden toe aan site_settings.
  Elke speltak heeft: naam, leeftijd, beschrijving en een link (href).

  Keys per speltak (index 0–5):
    speltak_0_naam, speltak_0_leeftijd, speltak_0_beschrijving, speltak_0_href
    ... t/m speltak_5_*

  Standaardwaarden zijn de huidige hardcoded waarden.
*/

INSERT INTO site_settings (key, value) VALUES
  ('speltak_0_naam',        'Bevers'),
  ('speltak_0_leeftijd',    '5 – 7 jaar'),
  ('speltak_0_beschrijving','De allerkleinsten van onze groep. Bevers spelen samen, leren de natuur kennen en maken hun eerste stappen in het scouting-avontuur.'),
  ('speltak_0_href',        ''),

  ('speltak_1_naam',        'Welpen'),
  ('speltak_1_leeftijd',    '7 – 11 jaar'),
  ('speltak_1_beschrijving','Welpen leren samenwerken, knutselen en spelen spannende buitenspellen. Ze groeien als een hecht roedel onder begeleiding van hun leiders.'),
  ('speltak_1_href',        ''),

  ('speltak_2_naam',        'Scouts'),
  ('speltak_2_leeftijd',    '11 – 15 jaar'),
  ('speltak_2_beschrijving','Scouts leren overleven in de natuur, werken aan badges en nemen deel aan nationale en internationale kampen. Avontuur staat centraal.'),
  ('speltak_2_href',        ''),

  ('speltak_3_naam',        'Verkenners'),
  ('speltak_3_leeftijd',    '14 – 17 jaar'),
  ('speltak_3_beschrijving','Verkenners verkennen de wereld op eigen kracht. Ze plannen hun eigen activiteiten en kampen, en nemen verantwoordelijkheid.'),
  ('speltak_3_href',        ''),

  ('speltak_4_naam',        'Explorers'),
  ('speltak_4_leeftijd',    '17 – 21 jaar'),
  ('speltak_4_beschrijving','Explorers werken aan grote projecten, helpen bij jongere speltakken en bereiden zich voor op een rol als leider.'),
  ('speltak_4_href',        ''),

  ('speltak_5_naam',        'Stam'),
  ('speltak_5_leeftijd',    '21+'),
  ('speltak_5_beschrijving','De Stam vormt het hart van de groep. Volwassen leden ondersteunen de organisatie, begeleiden jongeren en houden de traditie levend.'),
  ('speltak_5_href',        '')
ON CONFLICT (key) DO NOTHING;
