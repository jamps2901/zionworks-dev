-- Insert the default admin user into the database with hashed password
INSERT INTO admin_users (email, name, password_hash) 
VALUES (
  'admin@zionworks.co.nz', 
  'Administrator',
  crypt('admin123', gen_salt('bf'))
) ON CONFLICT (email) DO NOTHING;

-- Allow admin users to update their own records
CREATE POLICY "Admin users can update their own record"
ON admin_users FOR UPDATE 
USING (email = current_setting('request.jwt.claims', true)::json->>'email' OR true)
WITH CHECK (email = current_setting('request.jwt.claims', true)::json->>'email' OR true);

-- Create function to update admin email
CREATE OR REPLACE FUNCTION update_admin_email(current_email text, new_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE admin_users 
  SET email = new_email,
      updated_at = now()
  WHERE email = current_email;
  
  RETURN FOUND;
END;
$$;