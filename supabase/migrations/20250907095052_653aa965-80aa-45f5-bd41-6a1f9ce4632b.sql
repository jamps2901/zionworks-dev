-- Fix critical security vulnerability in services table
-- First check and drop all existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.services;
DROP POLICY IF EXISTS "Allow public read access to services" ON public.services;
DROP POLICY IF EXISTS "Block public insert on services" ON public.services;
DROP POLICY IF EXISTS "Block public update on services" ON public.services;
DROP POLICY IF EXISTS "Block public delete on services" ON public.services;

-- Create secure policies for services table
-- Allow public read access (services should be visible to everyone)
CREATE POLICY "Allow public read access to services" 
ON public.services 
FOR SELECT 
USING (true);

-- Block all public write operations
CREATE POLICY "Block public insert on services" 
ON public.services 
FOR INSERT 
WITH CHECK (false);

CREATE POLICY "Block public update on services" 
ON public.services 
FOR UPDATE 
USING (false);

CREATE POLICY "Block public delete on services" 
ON public.services 
FOR DELETE 
USING (false);

-- Create secure admin functions for managing services
CREATE OR REPLACE FUNCTION public.get_admin_services()
RETURNS TABLE(id bigint, created_at timestamp with time zone, title text, description text, icon_url text, category text, price text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT id, created_at, title, description, icon_url, category, price
  FROM services
  ORDER BY created_at DESC;
$function$;

CREATE OR REPLACE FUNCTION public.create_admin_service(
  p_title text, 
  p_description text, 
  p_icon_url text DEFAULT ''::text,
  p_category text DEFAULT ''::text,
  p_price text DEFAULT ''::text
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  new_service_id bigint;
BEGIN
  INSERT INTO services (title, description, icon_url, category, price)
  VALUES (p_title, p_description, p_icon_url, p_category, p_price)
  RETURNING id INTO new_service_id;
  
  RETURN new_service_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_admin_service(
  p_id bigint,
  p_title text, 
  p_description text, 
  p_icon_url text DEFAULT ''::text,
  p_category text DEFAULT ''::text,
  p_price text DEFAULT ''::text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  UPDATE services
  SET 
    title = p_title,
    description = p_description,
    icon_url = p_icon_url,
    category = p_category,
    price = p_price
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$function$;

CREATE OR REPLACE FUNCTION public.delete_admin_service(p_id bigint)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  DELETE FROM services WHERE id = p_id;
  RETURN FOUND;
END;
$function$;