/*
  # Fix Storage RLS policies for media bucket

  Adds a SELECT policy for authenticated admins (needed for storage to resolve
  existing files) and ensures the INSERT policy is complete.
*/

-- Allow admins to update/overwrite existing files
CREATE POLICY "Admins can update media in storage"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'media' AND
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  )
  WITH CHECK (
    bucket_id = 'media' AND
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );
