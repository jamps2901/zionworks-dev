-- Add onboarding tracking to client_users table
ALTER TABLE client_users ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT FALSE;
ALTER TABLE client_users ADD COLUMN onboarding_completed_at TIMESTAMP WITH TIME ZONE;

-- Create admin function to create client accounts manually
CREATE OR REPLACE FUNCTION create_client_account(
  p_company_name TEXT,
  p_contact_name TEXT,
  p_email TEXT,
  p_phone TEXT DEFAULT NULL,
  p_temporary_password TEXT DEFAULT NULL
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
  
  -- Create client user
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
    temp_password, -- Will be hashed in real implementation
    true,
    false
  ) RETURNING id INTO new_client_id;
  
  RETURN new_client_id;
END;
$$;

-- Function to complete onboarding
CREATE OR REPLACE FUNCTION complete_client_onboarding(
  p_client_id UUID,
  p_project_type TEXT,
  p_project_description TEXT,
  p_timeline TEXT DEFAULT NULL,
  p_budget_range TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  client_data RECORD;
  new_project_id UUID;
BEGIN
  -- Get client data
  SELECT * INTO client_data
  FROM client_users
  WHERE id = p_client_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Client not found';
  END IF;
  
  -- Mark onboarding as complete
  UPDATE client_users
  SET 
    has_completed_onboarding = TRUE,
    onboarding_completed_at = NOW()
  WHERE id = p_client_id;
  
  -- Create initial project
  INSERT INTO client_projects (
    client_id,
    project_name,
    description,
    current_stage,
    start_date,
    estimated_completion
  ) VALUES (
    p_client_id,
    p_project_type || ' - ' || client_data.company_name,
    p_project_description,
    'initial_brief',
    CURRENT_DATE,
    CURRENT_DATE + interval '3 months'
  ) RETURNING id INTO new_project_id;
  
  RETURN new_project_id;
END;
$$;

-- Function to reset onboarding (admin only)
CREATE OR REPLACE FUNCTION reset_client_onboarding(p_client_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE client_users
  SET 
    has_completed_onboarding = FALSE,
    onboarding_completed_at = NULL
  WHERE id = p_client_id;
  
  RETURN FOUND;
END;
$$;