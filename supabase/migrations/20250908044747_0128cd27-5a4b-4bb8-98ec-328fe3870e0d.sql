-- Fix the verify_client_login function to resolve ambiguous column reference
CREATE OR REPLACE FUNCTION public.verify_client_login(p_email text, p_password text)
RETURNS TABLE(client_id uuid, company_name text, contact_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  client_record RECORD;
BEGIN
  SELECT cu.id, cu.company_name, cu.contact_name INTO client_record
  FROM client_users cu
  WHERE cu.email = p_email 
    AND cu.password_hash = crypt(p_password, cu.password_hash)
    AND cu.is_active = true;
    
  IF client_record.id IS NOT NULL THEN
    UPDATE client_users SET last_login = now() WHERE id = client_record.id;
    RETURN QUERY SELECT client_record.id, client_record.company_name, client_record.contact_name;
  ELSE
    RETURN;
  END IF;
END;
$function$