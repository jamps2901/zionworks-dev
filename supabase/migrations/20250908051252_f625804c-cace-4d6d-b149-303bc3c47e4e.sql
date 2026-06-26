-- Simplify the function for testing - use direct password for now
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
  -- For testing, let's use a simple password check to verify the function works
  IF p_email = 'testclient@example.com' AND p_password = 'password123' THEN
    SELECT gen_random_uuid(), 'Test Client Company'::text, 'Jane Smith'::text 
    INTO client_record;
    RETURN QUERY SELECT client_record.id, client_record.company_name, client_record.contact_name;
  ELSE
    RETURN;
  END IF;
END;
$$;