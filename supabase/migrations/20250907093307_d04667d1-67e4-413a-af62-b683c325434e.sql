-- Create a simpler login function that doesn't use crypt
CREATE OR REPLACE FUNCTION verify_admin_login(p_email text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- For now, use direct credential checking
  IF p_email = 'jrpatnugot29@gmail.com' AND p_password = 'Patjo@1981' THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Also ensure admin user exists in simple format
DELETE FROM admin_users WHERE email = 'jrpatnugot29@gmail.com';
INSERT INTO admin_users (email, name, password_hash) 
VALUES (
  'jrpatnugot29@gmail.com', 
  'Administrator',
  'simple_hash_placeholder'
);