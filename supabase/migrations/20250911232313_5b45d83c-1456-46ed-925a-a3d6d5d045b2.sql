-- Create helper RPCs to enable client portal features without relying on Supabase Auth sessions

-- 1) Get projects for a client
CREATE OR REPLACE FUNCTION public.get_client_projects(p_client_id uuid)
RETURNS SETOF public.client_projects
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT * FROM public.client_projects
  WHERE client_id = p_client_id
  ORDER BY created_at DESC NULLS LAST;
$$;

-- 2) Get stages for a project
CREATE OR REPLACE FUNCTION public.get_project_stages(p_project_id uuid)
RETURNS SETOF public.project_stages
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT * FROM public.project_stages
  WHERE project_id = p_project_id
  ORDER BY created_at ASC NULLS LAST;
$$;

-- 3) Update client approval on a stage
CREATE OR REPLACE FUNCTION public.update_stage_approval(
  p_stage_id uuid,
  p_client_approval text,
  p_approval_notes text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.project_stages
  SET 
    client_approval = p_client_approval::approval_status,
    approval_notes = COALESCE(p_approval_notes, approval_notes),
    approved_at = CASE 
      WHEN p_client_approval IS NULL OR p_client_approval = 'pending' THEN NULL
      ELSE now()
    END,
    updated_at = now()
  WHERE id = p_stage_id;

  RETURN FOUND;
END;
$$;

-- 4) Get messages for a project
CREATE OR REPLACE FUNCTION public.get_project_messages(p_project_id uuid)
RETURNS SETOF public.project_messages
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT * FROM public.project_messages
  WHERE project_id = p_project_id
  ORDER BY created_at ASC NULLS LAST;
$$;

-- 5) Insert a project message from client portal
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
SET search_path TO 'public'
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.project_messages (
    project_id, sender_id, sender_name, sender_type, message_text
  ) VALUES (
    p_project_id, p_sender_id, p_sender_name, COALESCE(p_sender_type, 'client'), p_message_text
  ) RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- 6) Get files for a project
CREATE OR REPLACE FUNCTION public.get_project_files(p_project_id uuid)
RETURNS SETOF public.project_files
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT * FROM public.project_files
  WHERE project_id = p_project_id
  ORDER BY created_at DESC NULLS LAST;
$$;

-- 7) Delete a client account (admin-only action)
CREATE OR REPLACE FUNCTION public.delete_client_account(p_client_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.client_users WHERE id = p_client_id;
  RETURN FOUND;
END;
$$;

-- 8) Create default stages for a project after onboarding
CREATE OR REPLACE FUNCTION public.create_default_project_stages(p_project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert a standard set of stages if they don't already exist
  INSERT INTO public.project_stages (
    project_id, stage_name, stage_description, status, progress_percentage
  )
  SELECT p_project_id, s.stage_name, s.stage_description, 'not_started', 0
  FROM (
    VALUES
      ('kick_off', 'Project kickoff meeting, team introductions, and initial planning.'),
      ('requirements_gathering', 'Detailed requirements collection, analysis, and documentation.'),
      ('sow_upload_signoff', 'Statement of Work finalization and client approval.'),
      ('design', 'UI/UX design, wireframes, mockups, and design system creation.'),
      ('development', 'Core development work, feature implementation, and integration.'),
      ('testing', 'Quality assurance testing, system testing, and bug fixes.'),
      ('uat', 'User acceptance testing with client involvement and feedback.'),
      ('go_live', 'Production deployment, final testing, and launch preparation.'),
      ('post_go_live_support', 'Post-launch monitoring, support, and maintenance.')
  ) AS s(stage_name, stage_description)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.project_stages ps
    WHERE ps.project_id = p_project_id AND ps.stage_name = s.stage_name::project_stage
  );
END;
$$;