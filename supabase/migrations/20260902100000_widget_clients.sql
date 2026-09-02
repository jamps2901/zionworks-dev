-- Widget MVP: lets the founder onboard paying clients with an embeddable AI chat widget
-- (see plan: sell existing AI features as bolt-on add-ons for businesses that keep
-- their own site, rather than only selling full custom builds)

CREATE TABLE public.widget_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  business_name text NOT NULL,
  allowed_origins text[] NOT NULL DEFAULT '{}',
  system_prompt text NOT NULL,
  bot_display_name text NOT NULL DEFAULT 'Assistant',
  primary_color text NOT NULL DEFAULT '#2563eb',
  welcome_message text NOT NULL DEFAULT 'Hi! How can I help?',
  openai_model text NOT NULL DEFAULT 'gpt-5-2025-08-07',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.widget_clients ENABLE ROW LEVEL SECURITY;

-- No public read/write policy at all: the embed page and ai-chat function read via
-- the service-role key server-side, and admin writes go through the SECURITY DEFINER
-- RPCs below (each of which checks is_admin() itself). This keeps system_prompt and
-- allowed_origins out of reach of anon/authenticated clients entirely.

CREATE OR REPLACE FUNCTION public.get_admin_widget_clients()
RETURNS TABLE(
  id uuid, slug text, business_name text, allowed_origins text[],
  system_prompt text, bot_display_name text, primary_color text,
  welcome_message text, openai_model text, is_active boolean,
  created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT id, slug, business_name, allowed_origins, system_prompt,
         bot_display_name, primary_color, welcome_message, openai_model,
         is_active, created_at, updated_at
  FROM widget_clients
  WHERE is_admin()
  ORDER BY created_at DESC;
$function$;

CREATE OR REPLACE FUNCTION public.create_admin_widget_client(
  p_slug text,
  p_business_name text,
  p_allowed_origins text[],
  p_system_prompt text,
  p_bot_display_name text DEFAULT 'Assistant',
  p_primary_color text DEFAULT '#2563eb',
  p_welcome_message text DEFAULT 'Hi! How can I help?',
  p_openai_model text DEFAULT 'gpt-5-2025-08-07'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  new_id uuid;
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  INSERT INTO widget_clients (
    slug, business_name, allowed_origins, system_prompt,
    bot_display_name, primary_color, welcome_message, openai_model
  )
  VALUES (
    p_slug, p_business_name, p_allowed_origins, p_system_prompt,
    p_bot_display_name, p_primary_color, p_welcome_message, p_openai_model
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_admin_widget_client(
  p_id uuid,
  p_slug text,
  p_business_name text,
  p_allowed_origins text[],
  p_system_prompt text,
  p_bot_display_name text,
  p_primary_color text,
  p_welcome_message text,
  p_openai_model text,
  p_is_active boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  UPDATE widget_clients
  SET
    slug = p_slug,
    business_name = p_business_name,
    allowed_origins = p_allowed_origins,
    system_prompt = p_system_prompt,
    bot_display_name = p_bot_display_name,
    primary_color = p_primary_color,
    welcome_message = p_welcome_message,
    openai_model = p_openai_model,
    is_active = p_is_active,
    updated_at = now()
  WHERE id = p_id;

  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_admin_widget_client(p_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  DELETE FROM widget_clients WHERE id = p_id;
  RETURN FOUND;
END;
$function$;

-- Public, narrow read used by the embed page (/w/:slug) -- returns only
-- non-sensitive display fields, never system_prompt or allowed_origins.
CREATE OR REPLACE FUNCTION public.get_widget_public_config(p_slug text)
RETURNS TABLE(
  business_name text, bot_display_name text, primary_color text,
  welcome_message text, is_active boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT business_name, bot_display_name, primary_color, welcome_message, is_active
  FROM widget_clients
  WHERE slug = p_slug;
$function$;

GRANT EXECUTE ON FUNCTION public.get_widget_public_config(text) TO anon, authenticated;

-- Lightweight per-client rate limiting for the tenant-aware ai-chat path.
-- No external infra (Redis etc.) needed for a handful of pilot clients --
-- a row-count check against a short time window is enough.
CREATE TABLE public.widget_chat_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.widget_chat_log ENABLE ROW LEVEL SECURITY;
-- No client-facing policies at all: only written/read via SECURITY DEFINER
-- functions called from the ai-chat Edge Function using the service-role key.

CREATE INDEX idx_widget_chat_log_slug_time ON public.widget_chat_log (client_slug, created_at);

CREATE OR REPLACE FUNCTION public.check_widget_rate_limit(p_slug text, p_max_per_minute int DEFAULT 15)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  recent_count int;
BEGIN
  SELECT count(*) INTO recent_count
  FROM widget_chat_log
  WHERE client_slug = p_slug
    AND created_at > now() - interval '1 minute';

  IF recent_count >= p_max_per_minute THEN
    RETURN false;
  END IF;

  INSERT INTO widget_chat_log (client_slug) VALUES (p_slug);
  RETURN true;
END;
$function$;
