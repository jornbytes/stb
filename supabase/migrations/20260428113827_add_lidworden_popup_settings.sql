/*
  # Add Lid Worden popup settings

  Adds site_settings keys for the "Lid worden" popup so admins can edit
  the popup title, subtitle and button text from the Settings panel.

  New keys (all stored in site_settings):
    - lidworden_popup_title       : Header title inside the popup
    - lidworden_popup_subtitle    : Sub-line below the title
    - lidworden_popup_button      : Submit button label
    - lidworden_popup_success_title : Success state heading
    - lidworden_popup_success_text  : Success state body text
    - lidworden_popup_privacy_text  : Privacy notice at the bottom of the form

  No new tables — reuses the existing site_settings table.
  No RLS changes needed (site_settings already has the correct policies).
*/

INSERT INTO site_settings (key, value, updated_at)
VALUES
  ('lidworden_popup_title',         'Lid worden',                                                                                                   now()),
  ('lidworden_popup_subtitle',      'Scouting Titus Brandsma',                                                                                     now()),
  ('lidworden_popup_button',        'Aanmelding versturen',                                                                                         now()),
  ('lidworden_popup_success_title', 'Aanmelding ontvangen!',                                                                                       now()),
  ('lidworden_popup_success_text',  'Bedankt voor je aanmelding. We nemen zo snel mogelijk contact met je op om alles te bespreken. Welkom bij Scouting Titus Brandsma!', now()),
  ('lidworden_popup_privacy_text',  'Na je aanmelding nemen we contact met je op voor een kennismaking.',                                           now())
ON CONFLICT (key) DO NOTHING;
