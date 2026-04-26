/*
  # Add contact email setting

  Inserts a default `contact_email` key into the site_settings table so the admin
  can configure which email address receives all website notification emails.
*/

INSERT INTO site_settings (key, value)
VALUES ('contact_email', '')
ON CONFLICT (key) DO NOTHING;
