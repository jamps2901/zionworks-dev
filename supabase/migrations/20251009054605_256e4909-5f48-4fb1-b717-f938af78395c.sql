-- Phase 1: Fix Database Foundation

-- 1.1 Fix get_project_overview_stats function (ambiguous column reference)
DROP FUNCTION IF EXISTS public.get_project_overview_stats(uuid);

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
SET search_path TO 'public'
AS $function$
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

  -- Messages (last 7 days as proxy for unread)
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

  -- Current milestone
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

  -- Next deadline from stages
  SELECT MIN(due_date) INTO next_due FROM public.project_stages 
  WHERE project_id = p_project_id AND status <> 'completed' AND due_date IS NOT NULL;

  -- Estimated completion from project (fixed: qualified with table alias)
  SELECT cp.estimated_completion INTO est_comp 
  FROM public.client_projects cp 
  WHERE cp.id = p_project_id;

  current_milestone := COALESCE(current_stage, 'kick_off');
  next_deadline := COALESCE(TO_CHAR(next_due, 'Month DD, YYYY'), 'TBD');
  estimated_completion := COALESCE(TO_CHAR(est_comp, 'Month DD, YYYY'), 'TBD');

  RETURN NEXT;
END;
$function$;

-- 1.2 Enhance complete_client_onboarding to auto-create stages
DROP FUNCTION IF EXISTS public.complete_client_onboarding(uuid, text, text, text, text);

CREATE OR REPLACE FUNCTION public.complete_client_onboarding(
  p_client_id uuid,
  p_project_type text,
  p_project_description text,
  p_timeline text DEFAULT NULL,
  p_budget_range text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
    'kick_off',
    CURRENT_DATE,
    CURRENT_DATE + interval '3 months'
  ) RETURNING id INTO new_project_id;
  
  -- Auto-create default project stages
  PERFORM create_default_project_stages(new_project_id);
  
  RETURN new_project_id;
END;
$function$;

-- 1.3 Create new RPC functions for stage management

-- Update project stage details
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
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.project_stages
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

  RETURN FOUND;
END;
$function$;

-- Create new project stage
CREATE OR REPLACE FUNCTION public.create_project_stage(
  p_project_id uuid,
  p_stage_name text,
  p_stage_description text DEFAULT NULL,
  p_due_date date DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_stage_id UUID;
BEGIN
  INSERT INTO public.project_stages (
    project_id,
    stage_name,
    stage_description,
    status,
    progress_percentage,
    due_date
  ) VALUES (
    p_project_id,
    p_stage_name::project_stage,
    p_stage_description,
    'not_started',
    0,
    p_due_date
  ) RETURNING id INTO new_stage_id;
  
  RETURN new_stage_id;
END;
$function$;

-- Delete project stage
CREATE OR REPLACE FUNCTION public.delete_project_stage(p_stage_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.project_stages WHERE id = p_stage_id;
  RETURN FOUND;
END;
$function$;

-- Add team member to project
CREATE OR REPLACE FUNCTION public.add_project_team_member(
  p_project_id uuid,
  p_member_name text,
  p_role text,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_is_primary_contact boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_member_id UUID;
BEGIN
  INSERT INTO public.project_team_members (
    project_id,
    member_name,
    role,
    email,
    phone,
    is_primary_contact
  ) VALUES (
    p_project_id,
    p_member_name,
    p_role,
    p_email,
    p_phone,
    p_is_primary_contact
  ) RETURNING id INTO new_member_id;
  
  RETURN new_member_id;
END;
$function$;

-- Update team member
CREATE OR REPLACE FUNCTION public.update_project_team_member(
  p_member_id uuid,
  p_member_name text DEFAULT NULL,
  p_role text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_phone text DEFAULT NULL,
  p_is_primary_contact boolean DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.project_team_members
  SET 
    member_name = COALESCE(p_member_name, member_name),
    role = COALESCE(p_role, role),
    email = COALESCE(p_email, email),
    phone = COALESCE(p_phone, phone),
    is_primary_contact = COALESCE(p_is_primary_contact, is_primary_contact)
  WHERE id = p_member_id;

  RETURN FOUND;
END;
$function$;

-- Delete team member
CREATE OR REPLACE FUNCTION public.delete_project_team_member(p_member_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.project_team_members WHERE id = p_member_id;
  RETURN FOUND;
END;
$function$;

-- Update project details
CREATE OR REPLACE FUNCTION public.update_project_details(
  p_project_id uuid,
  p_project_name text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_start_date date DEFAULT NULL,
  p_estimated_completion date DEFAULT NULL,
  p_current_stage text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.client_projects
  SET 
    project_name = COALESCE(p_project_name, project_name),
    description = COALESCE(p_description, description),
    start_date = COALESCE(p_start_date, start_date),
    estimated_completion = COALESCE(p_estimated_completion, estimated_completion),
    current_stage = COALESCE(p_current_stage::project_stage, current_stage),
    updated_at = now()
  WHERE id = p_project_id;

  RETURN FOUND;
END;
$function$;