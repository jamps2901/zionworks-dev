-- Distinguish AI-drafted briefs from the classic multi-step wizard flow,
-- so the founder can tell which leads came from which path in the admin panel.
ALTER TABLE public.quotes
  ADD COLUMN source text NOT NULL DEFAULT 'wizard',
  ADD COLUMN ai_raw_description text;

CREATE OR REPLACE FUNCTION public.get_admin_quotes()
RETURNS TABLE (
  id bigint,
  created_at timestamptz,
  name text,
  email text,
  project_type text,
  timeline text,
  budget text,
  message text,
  source text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT id, created_at, name, email, project_type, timeline, budget, message, source
  FROM quotes
  ORDER BY created_at DESC;
$function$;
