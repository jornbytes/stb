/*
  # Voeg icon kolom toe aan nav_items

  Optioneel icoon voor navigatie-items. Als ingesteld, wordt het icoon
  getoond in de desktop navigatie i.p.v. de label-tekst (tekst blijft
  zichtbaar als tooltip en in het mobiele menu).

  Ondersteunde waarden: 'sol', 'google-drive', 'external-link', 'file', 'mail', '' (geen icoon)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'nav_items' AND column_name = 'icon'
  ) THEN
    ALTER TABLE nav_items ADD COLUMN icon text DEFAULT ''::text;
  END IF;
END $$;
