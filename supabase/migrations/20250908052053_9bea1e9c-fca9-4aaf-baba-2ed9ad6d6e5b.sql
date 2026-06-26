-- Fix the verify_client_login function to use actual client_users table
DROP FUNCTION IF EXISTS public.verify_client_login(text, text);

CREATE OR REPLACE FUNCTION public.verify_client_login(p_email text, p_password text)
RETURNS TABLE(client_id uuid, company_name text, contact_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  client_record RECORD;
BEGIN
  -- Query the actual client_users table
  SELECT id, company_name, contact_name
  INTO client_record
  FROM client_users
  WHERE email = p_email 
    AND password_hash = p_password 
    AND is_active = true;
  
  -- If client found, return the data
  IF FOUND THEN
    RETURN QUERY SELECT client_record.id, client_record.company_name, client_record.contact_name;
  ELSE
    RETURN;
  END IF;
END;
$$;

-- Insert a test client user for testing
INSERT INTO client_users (email, password_hash, company_name, contact_name, is_active)
VALUES ('testclient@example.com', 'password123', 'Test Client Company', 'Jane Smith', true)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name;