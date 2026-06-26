-- Fix onboarding: use valid project_stage enums and align defaults

-- 1) Replace complete_client_onboarding to start project at 'initial_brief'
CREATE OR REPLACE FUNCTION public.complete_client_onboarding(
  p_client_id uuid,
  p_project_type text,
  p_project_description text,
  p_timeline text DEFAULT NULL::text,
  p_budget_range text DEFAULT NULL::text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
  
  -- Create initial project with a valid enum value
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
  
  -- Auto-create default project stages
  PERFORM create_default_project_stages(new_project_id);
  
  RETURN new_project_id;
END;
$$;

-- 2) Replace create_default_project_stages to only use valid enum values
CREATE OR REPLACE FUNCTION public.create_default_project_stages(
  p_project_id uuid
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert a standard set of stages using existing enum values
  INSERT INTO public.project_stages (
    project_id, stage_name, stage_description, status, progress_percentage
  )
  SELECT p_project_id, s.stage_name::project_stage, s.stage_description, 'not_started', 0
  FROM (
    VALUES
      ('initial_brief', 'Project kickoff and initial requirements overview.'),
      ('scope_agreement', 'Define scope, deliverables, and sign-off.'),
      ('design_phase', 'Wireframes, UI/UX design, and prototypes.'),
      ('development', 'Implementation, integrations, and unit tests.'),
      ('testing_uat', 'QA testing and user acceptance.'),
      ('go_live', 'Deployment and launch activities.'),
      ('post_support', 'Post-launch support and optimizations.')
  ) AS s(stage_name, stage_description)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.project_stages ps
    WHERE ps.project_id = p_project_id AND ps.stage_name = s.stage_name::project_stage
  );
END;
$$;

-- 3) Align get_project_overview_stats fallback label
CREATE OR REPLACE FUNCTION public.get_project_overview_stats(
  p_project_id uuid
) RETURNS TABLE(
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
  SELECT COUNT(*) INTO completed_stages FROM public.project_tasks WHERE project_id = p_project_id AND completed_at IS NOT NULL;

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
  SELECT COUNT(*) INTO completed_tasks FROM public.project_stages WHERE project_id = p_project_id AND status = 'completed';
  overall_progress := CASE WHEN COALESCE(total_stages,0) = 0 THEN 0 ELSE ROUND((completed_tasks::numeric / total_stages::numeric) * 100)::int END;

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

  -- Estimated completion from project
  SELECT cp.estimated_completion INTO est_comp 
  FROM public.client_projects cp 
  WHERE cp.id = p_project_id;

  current_milestone := COALESCE(current_stage, 'initial_brief');
  next_deadline := COALESCE(TO_CHAR(next_due, 'Month DD, YYYY'), 'TBD');
  estimated_completion := COALESCE(TO_CHAR(est_comp, 'Month DD, YYYY'), 'TBD');

  RETURN NEXT;
END;
$$;