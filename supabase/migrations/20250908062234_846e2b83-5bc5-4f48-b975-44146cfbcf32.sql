-- Create client intake requests table
CREATE TABLE public.client_intake_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name text NOT NULL,
  contact_name text NOT NULL,
  email text NOT NULL,
  phone text,
  project_type text NOT NULL,
  project_description text,
  timeline text,
  budget_range text,
  agreement_accepted boolean NOT NULL DEFAULT false,
  signature_data text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_by uuid,
  reviewed_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.client_intake_requests ENABLE ROW LEVEL SECURITY;

-- Allow public insert for intake form submissions
CREATE POLICY "Allow public insert for intake requests" 
ON public.client_intake_requests 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view and manage intake requests
CREATE POLICY "Admins can manage intake requests" 
ON public.client_intake_requests 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE email = (current_setting('request.jwt.claims', true)::json->>'email')
));

-- Create updated_at trigger
CREATE TRIGGER update_client_intake_requests_updated_at
  BEFORE UPDATE ON public.client_intake_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create admin functions for managing intake requests
CREATE OR REPLACE FUNCTION public.approve_client_intake(
  p_request_id uuid,
  p_admin_email text,
  p_admin_notes text DEFAULT ''
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  intake_data record;
  new_client_id uuid;
  temp_password text;
BEGIN
  -- Get intake request data
  SELECT * INTO intake_data
  FROM client_intake_requests
  WHERE id = p_request_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Intake request not found or already processed';
  END IF;
  
  -- Generate temporary password
  temp_password := substr(md5(random()::text), 1, 12);
  
  -- Create client user
  INSERT INTO client_users (
    company_name,
    contact_name,
    email,
    password_hash,
    phone,
    is_active
  ) VALUES (
    intake_data.company_name,
    intake_data.contact_name,
    intake_data.email,
    temp_password, -- Will be hashed in real implementation
    intake_data.phone,
    true
  ) RETURNING id INTO new_client_id;
  
  -- Create initial project
  INSERT INTO client_projects (
    client_id,
    project_name,
    description,
    current_stage,
    start_date,
    estimated_completion
  ) VALUES (
    new_client_id,
    intake_data.project_type || ' - ' || intake_data.company_name,
    intake_data.project_description,
    'initial_brief',
    CURRENT_DATE,
    CURRENT_DATE + interval '3 months'
  );
  
  -- Update intake request status
  UPDATE client_intake_requests
  SET 
    status = 'approved',
    admin_notes = p_admin_notes,
    reviewed_by = (SELECT id FROM admin_users WHERE email = p_admin_email LIMIT 1),
    reviewed_at = now()
  WHERE id = p_request_id;
  
  RETURN new_client_id;
END;
$$;

-- Function to get pending intake requests
CREATE OR REPLACE FUNCTION public.get_pending_intake_requests()
RETURNS TABLE(
  id uuid,
  company_name text,
  contact_name text,
  email text,
  phone text,
  project_type text,
  project_description text,
  timeline text,
  budget_range text,
  created_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ir.id,
    ir.company_name,
    ir.contact_name,
    ir.email,
    ir.phone,
    ir.project_type,
    ir.project_description,
    ir.timeline,
    ir.budget_range,
    ir.created_at
  FROM client_intake_requests ir
  WHERE ir.status = 'pending'
  ORDER BY ir.created_at DESC;
$$;