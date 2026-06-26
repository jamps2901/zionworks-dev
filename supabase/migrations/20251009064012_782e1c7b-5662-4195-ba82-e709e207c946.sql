-- A. Add budget columns to client_projects table
ALTER TABLE client_projects 
ADD COLUMN IF NOT EXISTS budget_total NUMERIC,
ADD COLUMN IF NOT EXISTS budget_used NUMERIC DEFAULT 0;

-- E. Create project_events table for calendar
CREATE TABLE IF NOT EXISTS project_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  event_title TEXT NOT NULL,
  event_description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('meeting', 'testing', 'deadline', 'review', 'milestone')),
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_end_date TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL,
  created_by_type TEXT NOT NULL CHECK (created_by_type IN ('admin', 'client')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on project_events
ALTER TABLE project_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for project_events
CREATE POLICY "Admins can manage all events"
ON project_events
FOR ALL
USING (is_admin());

CREATE POLICY "Clients can view events for their projects"
ON project_events
FOR SELECT
USING (
  project_id IN (
    SELECT id FROM client_projects WHERE client_id = auth.uid()
  )
);

-- D. Create RPC function to delete project files
CREATE OR REPLACE FUNCTION delete_project_file(p_file_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM project_files WHERE id = p_file_id;
  RETURN FOUND;
END;
$$;

-- G. Create RPC function to reset client onboarding and delete all data
CREATE OR REPLACE FUNCTION reset_client_onboarding_and_data(p_client_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  project_ids uuid[];
BEGIN
  -- Get all project IDs for this client
  SELECT array_agg(id) INTO project_ids
  FROM client_projects
  WHERE client_id = p_client_id;
  
  -- Delete all related data for these projects
  IF project_ids IS NOT NULL THEN
    DELETE FROM project_tasks WHERE project_id = ANY(project_ids);
    DELETE FROM project_change_logs WHERE project_id = ANY(project_ids);
    DELETE FROM project_messages WHERE project_id = ANY(project_ids);
    DELETE FROM project_files WHERE project_id = ANY(project_ids);
    DELETE FROM project_team_members WHERE project_id = ANY(project_ids);
    DELETE FROM project_stages WHERE project_id = ANY(project_ids);
    DELETE FROM project_events WHERE project_id = ANY(project_ids);
    DELETE FROM project_invoices WHERE project_id = ANY(project_ids);
  END IF;
  
  -- Delete client notifications
  DELETE FROM client_notifications WHERE client_id = p_client_id;
  
  -- Delete all projects
  DELETE FROM client_projects WHERE client_id = p_client_id;
  
  -- Reset onboarding status
  UPDATE client_users
  SET 
    has_completed_onboarding = false,
    onboarding_completed_at = NULL
  WHERE id = p_client_id;
  
  RETURN FOUND;
END;
$$;

-- A. Create RPC function to get project activity log
CREATE OR REPLACE FUNCTION get_project_activity_log(p_project_id uuid)
RETURNS TABLE(
  id uuid,
  activity_type text,
  title text,
  description text,
  created_at timestamp with time zone,
  created_by_name text,
  metadata jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cl.id,
    cl.change_type as activity_type,
    cl.change_type as title,
    cl.description,
    cl.created_at,
    COALESCE(cu.contact_name, au.name, 'System') as created_by_name,
    cl.metadata
  FROM project_change_logs cl
  LEFT JOIN client_users cu ON cl.changed_by = cu.id AND cl.changed_by_type = 'client'
  LEFT JOIN admin_users au ON cl.changed_by = au.id AND cl.changed_by_type = 'admin'
  WHERE cl.project_id = p_project_id
  ORDER BY cl.created_at DESC
  LIMIT 50;
END;
$$;

-- E. Create trigger for project_events updated_at
CREATE TRIGGER update_project_events_updated_at
BEFORE UPDATE ON project_events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();