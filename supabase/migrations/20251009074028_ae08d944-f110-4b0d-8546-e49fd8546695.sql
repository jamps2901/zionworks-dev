-- Create security definer function to insert project events
CREATE OR REPLACE FUNCTION public.create_project_event(
  p_project_id uuid,
  p_event_title text,
  p_event_description text,
  p_event_type text,
  p_event_date timestamptz,
  p_event_location text,
  p_created_by uuid,
  p_created_by_type text,
  p_status text DEFAULT 'pending'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_event_id uuid;
BEGIN
  INSERT INTO project_events (
    project_id,
    event_title,
    event_description,
    event_type,
    event_date,
    event_location,
    created_by,
    created_by_type,
    status
  ) VALUES (
    p_project_id,
    p_event_title,
    p_event_description,
    p_event_type,
    p_event_date,
    p_event_location,
    p_created_by,
    p_created_by_type,
    p_status
  ) RETURNING id INTO new_event_id;
  
  RETURN new_event_id;
END;
$$;

-- Create security definer function to update event status
CREATE OR REPLACE FUNCTION public.update_project_event_status(
  p_event_id uuid,
  p_status text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE project_events
  SET status = p_status,
      updated_at = now()
  WHERE id = p_event_id;
  
  RETURN FOUND;
END;
$$;

-- Create security definer function to get project events
CREATE OR REPLACE FUNCTION public.get_project_events(p_project_id uuid)
RETURNS SETOF project_events
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM project_events
  WHERE project_id = p_project_id
  ORDER BY event_date ASC;
$$;