-- Add RLS policies and functions
CREATE POLICY "Clients can view their own projects" ON client_projects
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "Admins can view all projects" ON client_projects
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM admin_users WHERE email = (current_setting('request.jwt.claims', true)::json->>'email')
  ));

CREATE POLICY "Admins can manage projects" ON client_projects
  FOR ALL USING (EXISTS (
    SELECT 1 FROM admin_users WHERE email = (current_setting('request.jwt.claims', true)::json->>'email')
  ));

-- RLS Policies for project_stages
CREATE POLICY "Clients can view stages for their projects" ON project_stages
  FOR SELECT USING (
    project_id IN (SELECT id FROM client_projects WHERE client_id = auth.uid())
  );

CREATE POLICY "Clients can update approval status on their project stages" ON project_stages
  FOR UPDATE USING (
    project_id IN (SELECT id FROM client_projects WHERE client_id = auth.uid())
  );

CREATE POLICY "Admins can manage all project stages" ON project_stages
  FOR ALL USING (EXISTS (
    SELECT 1 FROM admin_users WHERE email = (current_setting('request.jwt.claims', true)::json->>'email')
  ));

-- RLS Policies for project_files
CREATE POLICY "Clients can view files for their projects" ON project_files
  FOR SELECT USING (
    project_id IN (SELECT id FROM client_projects WHERE client_id = auth.uid())
  );

CREATE POLICY "Clients can upload files to their projects" ON project_files
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM client_projects WHERE client_id = auth.uid())
    AND uploaded_by = auth.uid()
  );

CREATE POLICY "Admins can manage all project files" ON project_files
  FOR ALL USING (EXISTS (
    SELECT 1 FROM admin_users WHERE email = (current_setting('request.jwt.claims', true)::json->>'email')
  ));

-- RLS Policies for project_messages
CREATE POLICY "Clients can view messages for their projects" ON project_messages
  FOR SELECT USING (
    project_id IN (SELECT id FROM client_projects WHERE client_id = auth.uid())
  );

CREATE POLICY "Clients can send messages to their projects" ON project_messages
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM client_projects WHERE client_id = auth.uid())
    AND sender_id = auth.uid()
  );

CREATE POLICY "Admins can manage all project messages" ON project_messages
  FOR ALL USING (EXISTS (
    SELECT 1 FROM admin_users WHERE email = (current_setting('request.jwt.claims', true)::json->>'email')
  ));

-- RLS Policies for client_users
CREATE POLICY "Block public access to client users" ON client_users
  FOR ALL USING (false);

-- RLS Policies for project_change_logs
CREATE POLICY "Clients can view change logs for their projects" ON project_change_logs
  FOR SELECT USING (
    project_id IN (SELECT id FROM client_projects WHERE client_id = auth.uid())
  );

CREATE POLICY "System can insert change logs" ON project_change_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all change logs" ON project_change_logs
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM admin_users WHERE email = (current_setting('request.jwt.claims', true)::json->>'email')
  ));

-- Triggers for updated_at columns
CREATE TRIGGER update_client_projects_updated_at
  BEFORE UPDATE ON client_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_stages_updated_at
  BEFORE UPDATE ON project_stages  
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_users_updated_at
  BEFORE UPDATE ON client_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Functions for client authentication
CREATE OR REPLACE FUNCTION verify_client_login(p_email TEXT, p_password TEXT)
RETURNS TABLE(client_id UUID, company_name TEXT, contact_name TEXT) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_record RECORD;
BEGIN
  SELECT id, company_name, contact_name INTO client_record
  FROM client_users 
  WHERE email = p_email 
    AND password_hash = crypt(p_password, password_hash)
    AND is_active = true;
    
  IF client_record.id IS NOT NULL THEN
    UPDATE client_users SET last_login = now() WHERE id = client_record.id;
    RETURN QUERY SELECT client_record.id, client_record.company_name, client_record.contact_name;
  ELSE
    RETURN;
  END IF;
END;
$$;

-- Function to create change log entries
CREATE OR REPLACE FUNCTION log_project_change(
  p_project_id UUID,
  p_change_type TEXT,
  p_description TEXT,
  p_changed_by UUID,
  p_changed_by_type TEXT,
  p_stage_context project_stage DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO project_change_logs (
    project_id, change_type, description, changed_by, 
    changed_by_type, stage_context, metadata
  ) VALUES (
    p_project_id, p_change_type, p_description, p_changed_by,
    p_changed_by_type, p_stage_context, p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;