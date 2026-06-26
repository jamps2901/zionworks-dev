-- Fix the function search path security warning
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT AS $$
BEGIN
  RETURN ((current_setting('request.jwt.claims', true))::json ->> 'email');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;