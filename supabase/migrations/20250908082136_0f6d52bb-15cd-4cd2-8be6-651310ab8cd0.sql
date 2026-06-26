-- Fix client login authentication

-- First drop the existing function
DROP FUNCTION IF EXISTS public.verify_client_login(text, text);

-- Create the updated function that returns all needed data
CREATE OR REPLACE FUNCTION public.verify_client_login(p_email text, p_password text)
RETURNS TABLE(client_id uuid, company_name text, contact_name text, has_completed_onboarding boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Return the complete client data directly from the function
  RETURN QUERY 
  SELECT 
    cu.id as client_id,
    cu.company_name,
    cu.contact_name,
    cu.has_completed_onboarding
  FROM client_users cu
  WHERE cu.email = p_email 
    AND cu.password_hash = p_password 
    AND cu.is_active = true;
END;
$$;