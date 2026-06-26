-- Enable the pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Now insert the admin user with the correct credentials and hashed password
DELETE FROM admin_users WHERE email IN ('admin@zionworks.co.nz', 'jrpatnugot29@gmail.com');

INSERT INTO admin_users (email, name, password_hash) 
VALUES (
  'jrpatnugot29@gmail.com', 
  'Administrator',
  crypt('Patjo@1981', gen_salt('bf'))
);

-- Recreate the verify_admin_login function to ensure it works properly
CREATE OR REPLACE FUNCTION verify_admin_login(p_email text, p_password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_hash text;
BEGIN
  SELECT password_hash INTO stored_hash
  FROM admin_users
  WHERE email = p_email;
  
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN (stored_hash = crypt(p_password, stored_hash));
END;
$$;