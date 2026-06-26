-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Now recreate the function with proper extension reference
DROP FUNCTION IF EXISTS public.verify_client_login(text, text);

CREATE OR REPLACE FUNCTION public.verify_client_login(p_email text, p_password text)
RETURNS TABLE(client_id uuid, company_name text, contact_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public, extensions'
AS $$
DECLARE
  client_record RECORD;
BEGIN
  SELECT cu.id, cu.company_name, cu.contact_name INTO client_record
  FROM public.client_users cu
  WHERE cu.email = p_email 
    AND cu.password_hash = public.crypt(p_password, cu.password_hash)
    AND cu.is_active = true;
    
  IF client_record.id IS NOT NULL THEN
    UPDATE public.client_users SET last_login = now() WHERE id = client_record.id;
    RETURN QUERY SELECT client_record.id, client_record.company_name, client_record.contact_name;
  ELSE
    RETURN;
  END IF;
END;
$$;