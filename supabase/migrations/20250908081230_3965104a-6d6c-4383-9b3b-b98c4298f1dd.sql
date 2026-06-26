-- Create function to handle ghost client cleanup and recreation
CREATE OR REPLACE FUNCTION public.recover_ghost_client(
  p_email text,
  p_company_name text,
  p_contact_name text,
  p_phone text DEFAULT NULL,
  p_temporary_password text DEFAULT NULL
) 
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_client_id UUID;
  temp_password TEXT;
BEGIN
  -- Generate temporary password if not provided
  temp_password := COALESCE(p_temporary_password, substr(md5(random()::text), 1, 12));
  
  -- Delete any existing ghost client with this email
  DELETE FROM client_users WHERE email = p_email;
  
  -- Create new client user
  INSERT INTO client_users (
    company_name,
    contact_name,
    email,
    phone,
    password_hash,
    is_active,
    has_completed_onboarding
  ) VALUES (
    p_company_name,
    p_contact_name,
    p_email,
    p_phone,
    temp_password,
    true,
    false
  ) RETURNING id INTO new_client_id;
  
  RETURN new_client_id;
END;
$$;