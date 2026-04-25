/*
  # Create website users table with roles

  1. New Tables
    - `website_users`
      - `id` (uuid, primary key)
      - `auth_user_id` (uuid) - references auth.users
      - `email` (text, unique) - user email
      - `display_name` (text) - display name
      - `role` (text) - 'admin' | 'blogposter' | 'lid'
      - `must_change_password` (boolean)
      - `created_by` (uuid) - admin who created this user
      - `created_at` (timestamptz)
      - `last_login` (timestamptz)

  2. Security
    - RLS enabled
    - Admins (admin_users.id = auth.uid()) can manage all users
    - Users can read their own record

  Note: admin_users.id = auth.users.id
*/

CREATE TABLE IF NOT EXISTS website_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text UNIQUE NOT NULL DEFAULT '',
  display_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'lid',
  must_change_password boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

ALTER TABLE website_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all website users"
  ON website_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Admins can insert website users"
  ON website_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Admins can update website users"
  ON website_users FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Admins can delete website users"
  ON website_users FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.id = auth.uid())
  );

CREATE POLICY "Users can view own record"
  ON website_users FOR SELECT
  TO authenticated
  USING (auth_user_id = auth.uid());
