-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
  );
$$;

-- Update RLS policies to allow admin access

-- Quotes table policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON quotes;
CREATE POLICY "Enable all operations for authenticated users and admins" 
ON quotes FOR ALL 
USING (auth.role() = 'authenticated' OR is_admin());

-- Contacts table policies  
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON contacts;
CREATE POLICY "Enable all operations for authenticated users and admins"
ON contacts FOR ALL
USING (auth.role() = 'authenticated' OR is_admin());

-- Bookings table policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON bookings;
CREATE POLICY "Enable all operations for authenticated users and admins"
ON bookings FOR ALL  
USING (auth.role() = 'authenticated' OR is_admin());

-- Add function to update admin password
CREATE OR REPLACE FUNCTION update_admin_password(admin_email text, new_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE admin_users 
  SET password_hash = crypt(new_password, gen_salt('bf'))
  WHERE email = admin_email;
  
  RETURN FOUND;
END;
$$;