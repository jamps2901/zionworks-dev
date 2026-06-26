-- Allow admins to delete client users (for cleanup of orphaned accounts)
CREATE POLICY "Allow admins to delete client users" 
ON public.client_users 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
));

-- Allow admins to insert client users (needed for manual recovery)
CREATE POLICY "Allow admins to insert client users" 
ON public.client_users 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM admin_users 
  WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
));