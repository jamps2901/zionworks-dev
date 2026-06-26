-- Fix insert_project_message to cast sender_type to correct enum and add supportive RPCs
-- and add overview stats and team members RPC plus file metadata creation RPC

-- 1) Replace function insert_project_message with proper enum cast
CREATE OR REPLACE FUNCTION public.insert_project_message(
  p_project_id uuid,
  p_sender_id uuid,
  p_sender_name text,
  p_message_text text,
  p_sender_type text DEFAULT 'client'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.project_messages (
    project_id, sender_id, sender_name, sender_type, message_text
  ) VALUES (
    p_project_id,
    p_sender_id,
    p_sender_name,
    p_sender_type::message_type,
    p_message_text
  ) RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- 2) Overview stats RPC
CREATE OR REPLACE FUNCTION public.get_project_overview_stats(p_project_id uuid)
RETURNS TABLE(
  total_tasks integer,
  completed_tasks integer,
  upcoming_deadlines integer,
  unread_messages integer,
  files_shared integer,
  team_members integer,
  overall_progress integer,
  current_milestone text,
  next_deadline text,
  estimated_completion text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  total_stages integer;
  completed_stages integer;
  current_stage text;
  next_due date;
  est_comp date;
BEGIN
  -- Tasks
  SELECT COUNT(*) INTO total_tasks FROM public.project_tasks WHERE project_id = p_project_id;
  SELECT COUNT(*) INTO completed_tasks FROM public.project_tasks WHERE project_id = p_project_id AND completed_at IS NOT NULL;

  -- Deadlines (next 30 days)
  SELECT COUNT(*) INTO upcoming_deadlines FROM public.project_tasks 
  WHERE project_id = p_project_id 
    AND due_date IS NOT NULL 
    AND due_date >= CURRENT_DATE 
    AND due_date <= CURRENT_DATE + interval '30 days';

  -- Messages (last 7 days as a simple proxy for unread)
  SELECT COUNT(*) INTO unread_messages FROM public.project_messages 
  WHERE project_id = p_project_id 
    AND created_at >= now() - interval '7 days';

  -- Files
  SELECT COUNT(*) INTO files_shared FROM public.project_files WHERE project_id = p_project_id;

  -- Team members
  SELECT COUNT(*) INTO team_members FROM public.project_team_members WHERE project_id = p_project_id;

  -- Progress based on stages
  SELECT COUNT(*) INTO total_stages FROM public.project_stages WHERE project_id = p_project_id;
  SELECT COUNT(*) INTO completed_stages FROM public.project_stages WHERE project_id = p_project_id AND status = 'completed';
  overall_progress := CASE WHEN COALESCE(total_stages,0) = 0 THEN 0 ELSE ROUND((completed_stages::numeric / total_stages::numeric) * 100)::int END;

  -- Current milestone: in_progress else last completed else first not started
  SELECT stage_name::text INTO current_stage FROM public.project_stages 
  WHERE project_id = p_project_id AND status = 'in_progress'
  ORDER BY updated_at DESC NULLS LAST
  LIMIT 1;
  IF current_stage IS NULL THEN
    SELECT stage_name::text INTO current_stage FROM public.project_stages 
    WHERE project_id = p_project_id AND status = 'completed'
    ORDER BY completed_at DESC NULLS LAST
    LIMIT 1;
  END IF;
  IF current_stage IS NULL THEN
    SELECT stage_name::text INTO current_stage FROM public.project_stages 
    WHERE project_id = p_project_id
    ORDER BY created_at ASC NULLS LAST
    LIMIT 1;
  END IF;

  -- Next deadline from stages due_date
  SELECT MIN(due_date) INTO next_due FROM public.project_stages 
  WHERE project_id = p_project_id AND status <> 'completed' AND due_date IS NOT NULL;

  -- Estimated completion from project
  SELECT estimated_completion INTO est_comp FROM public.client_projects WHERE id = p_project_id;

  current_milestone := COALESCE(current_stage, 'kick_off');
  next_deadline := COALESCE(TO_CHAR(next_due, 'Month DD, YYYY'), 'TBD');
  estimated_completion := COALESCE(TO_CHAR(est_comp, 'Month DD, YYYY'), 'TBD');

  RETURN NEXT;
END;
$$;

-- 3) Secure RPC to fetch team members bypassing RLS for clients without auth
CREATE OR REPLACE FUNCTION public.get_project_team_members(p_project_id uuid)
RETURNS SETOF project_team_members
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT * FROM public.project_team_members
  WHERE project_id = p_project_id
  ORDER BY is_primary_contact DESC, created_at ASC NULLS LAST;
$$;

-- 4) Secure RPC to create file metadata (so clients can add file records even without auth session)
CREATE OR REPLACE FUNCTION public.create_project_file_metadata(
  p_project_id uuid,
  p_uploaded_by uuid,
  p_uploaded_by_type text,
  p_file_name text,
  p_file_type text,
  p_file_size bigint,
  p_description text DEFAULT NULL,
  p_stage_name project_stage DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_file_id uuid;
BEGIN
  INSERT INTO public.project_files (
    project_id, uploaded_by, uploaded_by_type, file_name, file_type, file_size,
    description, requires_approval, approval_status, stage_name, file_path
  ) VALUES (
    p_project_id, p_uploaded_by, p_uploaded_by_type, p_file_name, p_file_type, p_file_size,
    COALESCE(p_description, ''), false, 'pending', p_stage_name, ''
  ) RETURNING id INTO new_file_id;

  RETURN new_file_id;
END;
$$;