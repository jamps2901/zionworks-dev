-- Function to recalculate project's current_stage based on stages
CREATE OR REPLACE FUNCTION public.recalc_project_current_stage(p_project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  calculated_stage project_stage;
BEGIN
  -- First try to get the most recent 'in_progress' stage
  SELECT stage_name INTO calculated_stage
  FROM project_stages
  WHERE project_id = p_project_id
    AND status = 'in_progress'
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 1;

  -- If no in_progress stage, get most recent completed stage
  IF calculated_stage IS NULL THEN
    SELECT stage_name INTO calculated_stage
    FROM project_stages
    WHERE project_id = p_project_id
      AND status = 'completed'
    ORDER BY completed_at DESC NULLS LAST
    LIMIT 1;
  END IF;

  -- If still null, get earliest created stage
  IF calculated_stage IS NULL THEN
    SELECT stage_name INTO calculated_stage
    FROM project_stages
    WHERE project_id = p_project_id
    ORDER BY created_at ASC NULLS LAST
    LIMIT 1;
  END IF;

  -- Update the project with calculated stage (or default)
  UPDATE client_projects
  SET current_stage = COALESCE(calculated_stage, 'initial_brief'::project_stage),
      updated_at = now()
  WHERE id = p_project_id;
END;
$$;

-- Update update_project_stage_details to call recalc after stage edits
CREATE OR REPLACE FUNCTION public.update_project_stage_details(
  p_stage_id uuid, 
  p_stage_description text DEFAULT NULL, 
  p_due_date date DEFAULT NULL, 
  p_assigned_team_members text[] DEFAULT NULL, 
  p_progress_percentage integer DEFAULT NULL, 
  p_status text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stage_project_id uuid;
BEGIN
  -- Get project_id for later
  SELECT project_id INTO stage_project_id
  FROM project_stages
  WHERE id = p_stage_id;

  UPDATE project_stages
  SET 
    stage_description = COALESCE(p_stage_description, stage_description),
    due_date = COALESCE(p_due_date, due_date),
    assigned_team_members = COALESCE(p_assigned_team_members, assigned_team_members),
    progress_percentage = COALESCE(p_progress_percentage, progress_percentage),
    status = COALESCE(p_status, status),
    updated_at = now(),
    completed_at = CASE 
      WHEN p_status = 'completed' AND status <> 'completed' THEN now()
      WHEN p_status <> 'completed' THEN NULL
      ELSE completed_at
    END
  WHERE id = p_stage_id;

  -- Recalculate project's current_stage after any stage edit
  IF stage_project_id IS NOT NULL THEN
    PERFORM recalc_project_current_stage(stage_project_id);
  END IF;

  RETURN FOUND;
END;
$$;

-- Function to get project basic data (bypass RLS for client auth)
CREATE OR REPLACE FUNCTION public.get_project_basic_data(p_project_id uuid)
RETURNS TABLE(
  start_date date,
  estimated_completion date,
  budget_total numeric,
  budget_used numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    start_date,
    estimated_completion,
    budget_total,
    budget_used
  FROM client_projects
  WHERE id = p_project_id;
$$;

-- Function to get client notifications (bypass RLS for client auth)
CREATE OR REPLACE FUNCTION public.get_client_notifications(p_client_id uuid)
RETURNS SETOF client_notifications
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM client_notifications
  WHERE client_id = p_client_id
  ORDER BY created_at DESC;
$$;

-- Function to create notification for events
CREATE OR REPLACE FUNCTION public.create_notification_for_event(
  p_client_id uuid,
  p_project_id uuid,
  p_title text,
  p_message text,
  p_type text DEFAULT 'info'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO client_notifications (
    client_id, project_id, title, message, type
  ) VALUES (
    p_client_id, p_project_id, p_title, p_message, p_type
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- Trigger function to create notifications for new events
CREATE OR REPLACE FUNCTION public.notify_event_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_id_value uuid;
  notification_title text;
  notification_message text;
BEGIN
  -- Get client_id from project
  SELECT client_id INTO client_id_value
  FROM client_projects
  WHERE id = NEW.project_id;

  IF client_id_value IS NULL THEN
    RETURN NEW;
  END IF;

  -- Create appropriate notification based on event type and created_by
  IF NEW.created_by_type = 'admin' THEN
    notification_title := 'New Event Scheduled';
    notification_message := 'A new ' || NEW.event_type || ' event "' || NEW.event_title || '" has been scheduled for your project.';
  ELSE
    notification_title := 'Event Created';
    notification_message := 'Your ' || NEW.event_type || ' event "' || NEW.event_title || '" has been created successfully.';
  END IF;

  -- Insert notification
  PERFORM create_notification_for_event(
    client_id_value,
    NEW.project_id,
    notification_title,
    notification_message,
    'info'
  );

  RETURN NEW;
END;
$$;

-- Create trigger for event notifications
DROP TRIGGER IF EXISTS trigger_notify_event_created ON project_events;
CREATE TRIGGER trigger_notify_event_created
  AFTER INSERT ON project_events
  FOR EACH ROW
  EXECUTE FUNCTION notify_event_created();

-- Set REPLICA IDENTITY FULL for realtime subscriptions
ALTER TABLE project_stages REPLICA IDENTITY FULL;
ALTER TABLE client_projects REPLICA IDENTITY FULL;
ALTER TABLE client_notifications REPLICA IDENTITY FULL;
ALTER TABLE project_events REPLICA IDENTITY FULL;