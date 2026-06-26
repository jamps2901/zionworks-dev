-- Drop and recreate the verify_client_login function to ensure it works
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
  -- Check if client_users table exists first
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'client_users') THEN
    RAISE EXCEPTION 'client_users table does not exist';
  END IF;

  SELECT cu.id, cu.company_name, cu.contact_name INTO client_record
  FROM public.client_users cu
  WHERE cu.email = p_email 
    AND cu.password_hash = crypt(p_password, cu.password_hash)
    AND cu.is_active = true;
    
  IF client_record.id IS NOT NULL THEN
    UPDATE public.client_users SET last_login = now() WHERE id = client_record.id;
    RETURN QUERY SELECT client_record.id, client_record.company_name, client_record.contact_name;
  ELSE
    RETURN;
  END IF;
END;
$$;