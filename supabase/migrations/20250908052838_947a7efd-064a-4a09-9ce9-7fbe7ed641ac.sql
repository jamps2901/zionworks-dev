-- Fix the verify_client_login function to resolve ambiguous column references
DROP FUNCTION IF EXISTS public.verify_client_login(text, text);

CREATE OR REPLACE FUNCTION public.verify_client_login(p_email text, p_password text)
RETURNS TABLE(client_id uuid, company_name text, contact_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Return the client data directly without using intermediate variables
  RETURN QUERY 
  SELECT 
    cu.id as client_id,
    cu.company_name,
    cu.contact_name
  FROM client_users cu
  WHERE cu.email = p_email 
    AND cu.password_hash = p_password 
    AND cu.is_active = true;
END;
$$;

-- Also create tables for the project lifecycle tracking
CREATE TABLE IF NOT EXISTS project_team_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid REFERENCES client_projects(id) ON DELETE CASCADE,
  member_name text NOT NULL,
  role text NOT NULL,
  email text,
  phone text,
  is_primary_contact boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on project team members
ALTER TABLE project_team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for project team members
CREATE POLICY "Clients can view team members for their projects" 
ON project_team_members 
FOR SELECT 
USING (project_id IN (
  SELECT id FROM client_projects WHERE client_id = auth.uid()
));

CREATE POLICY "Admins can manage all team members" 
ON project_team_members 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE email = (current_setting('request.jwt.claims', true)::json->>'email')
));

-- Update project stages to include all waterfall stages
DO $$
BEGIN
  -- Check if the enum needs to be updated
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'kick_off' AND enumtypid = 'project_stage'::regtype) THEN
    -- Drop and recreate the enum with all stages
    ALTER TYPE project_stage RENAME TO project_stage_old;
    
    CREATE TYPE project_stage AS ENUM (
      'kick_off',
      'requirements_gathering', 
      'sow_upload_signoff',
      'design',
      'development',
      'testing',
      'uat',
      'go_live',
      'post_go_live_support'
    );
    
    -- Update existing tables
    ALTER TABLE client_projects ALTER COLUMN current_stage TYPE project_stage USING current_stage::text::project_stage;
    ALTER TABLE project_stages ALTER COLUMN stage_name TYPE project_stage USING stage_name::text::project_stage;
    ALTER TABLE project_messages ALTER COLUMN stage_context TYPE project_stage USING stage_context::text::project_stage;
    ALTER TABLE project_change_logs ALTER COLUMN stage_context TYPE project_stage USING stage_context::text::project_stage;
    ALTER TABLE project_files ALTER COLUMN stage_name TYPE project_stage USING stage_name::text::project_stage;
    
    DROP TYPE project_stage_old;
  END IF;
END $$;