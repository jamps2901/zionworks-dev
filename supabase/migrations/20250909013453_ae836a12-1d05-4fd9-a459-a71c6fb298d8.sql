-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_users_email ON client_users(email);
CREATE INDEX IF NOT EXISTS idx_client_projects_client_id ON client_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_project_stages_project_id ON project_stages(project_id);

-- Update client management view with proper RLS policy fixes
-- Ensure admin functions work correctly
ALTER TABLE client_users ENABLE ROW LEVEL SECURITY;

-- Fix the admin access policy to be more permissive for admin functions
DROP POLICY IF EXISTS "Allow admins to view client users" ON client_users;
CREATE POLICY "Allow admins to view client users" 
ON client_users FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = ((current_setting('request.jwt.claims', true))::json ->> 'email')
  ) OR auth.uid() = id  -- Allow clients to see their own record
);

-- Ensure projects are properly created during onboarding
-- Fix any potential foreign key or constraint issues
ALTER TABLE client_projects DROP CONSTRAINT IF EXISTS client_projects_client_id_fkey;
ALTER TABLE client_projects ADD CONSTRAINT client_projects_client_id_fkey 
  FOREIGN KEY (client_id) REFERENCES client_users(id) ON DELETE CASCADE;