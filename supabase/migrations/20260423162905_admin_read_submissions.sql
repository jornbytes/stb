/*
  # Allow admins to read membership_requests

  Adds a SELECT policy so authenticated admin users can view all form submissions.
*/

CREATE POLICY "Admins can read membership requests"
  ON membership_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid()
    )
  );
