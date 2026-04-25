/*
  # Create media library table and storage

  1. New Tables
    - `media_files`
      - `id` (uuid, primary key)
      - `filename` (text) - original filename
      - `storage_path` (text) - path in Supabase storage bucket
      - `public_url` (text) - public accessible URL
      - `mime_type` (text) - file MIME type
      - `size` (bigint) - file size in bytes
      - `uploaded_by` (uuid) - references auth.users
      - `created_at` (timestamptz)

  2. Storage
    - Creates bucket `media` for file uploads

  3. Security
    - RLS enabled on `media_files`
    - Authenticated admins (those in admin_users by id) can insert/select/delete
    - Public anon users can also select (to display images on public pages)

  Note: admin_users.id = auth.users.id (the id column IS the auth user id)
*/

CREATE TABLE IF NOT EXISTS media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL DEFAULT '',
  storage_path text NOT NULL DEFAULT '',
  public_url text NOT NULL DEFAULT '',
  mime_type text NOT NULL DEFAULT '',
  size bigint NOT NULL DEFAULT 0,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view media files"
  ON media_files FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Public can view media file metadata"
  ON media_files FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admins can insert media files"
  ON media_files FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Admins can delete media files"
  ON media_files FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

-- Create storage bucket for media uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Admins can upload media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media' AND
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Public can view media"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'media');

CREATE POLICY "Admins can delete media from storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'media' AND
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );
