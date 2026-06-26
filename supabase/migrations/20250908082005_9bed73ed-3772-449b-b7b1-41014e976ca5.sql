-- Fix client login authentication by updating RLS policies and function

-- First, update the verify_client_login function to return all needed data
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

-- Create a new RLS policy to allow clients to authenticate themselves
CREATE POLICY "Allow client login verification" 
ON public.client_users 
FOR SELECT 
USING (
  -- This policy allows access during the authentication process
  current_setting('role') = 'authenticator' OR
  -- Allow authenticated clients to view their own record
  id = auth.uid()
);