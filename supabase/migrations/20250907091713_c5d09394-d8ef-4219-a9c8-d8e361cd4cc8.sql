-- Add verify_admin_login function for password verification
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