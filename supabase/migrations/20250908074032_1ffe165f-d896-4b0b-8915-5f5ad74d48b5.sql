-- Allow admins to read client users
CREATE POLICY "Allow admins to view client users" 
ON public.client_users 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
));

-- Allow admins to update client users (for resetting onboarding)
CREATE POLICY "Allow admins to update client users" 
ON public.client_users 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
));