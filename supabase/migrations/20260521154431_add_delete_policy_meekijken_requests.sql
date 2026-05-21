/*
  # Voeg DELETE policy toe aan meekijken_requests

  Authenticated gebruikers (admins) kunnen meekijken aanmeldingen verwijderen.
*/

CREATE POLICY "Authenticated users can delete meekijken requests"
  ON meekijken_requests
  FOR DELETE
  TO authenticated
  USING (true);
