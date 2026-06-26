-- Fix the critical security vulnerability in admin_users table

-- Drop the current overly permissive policy that allows public access
DROP POLICY IF EXISTS "Admin users can view their own record" ON admin_users;

-- Create a proper restrictive policy that only allows authenticated admin users
-- to view their own records when they're logged into the system
CREATE POLICY "Authenticated admin users can view their own record"
ON admin_users FOR SELECT
USING (
  -- Only allow access if the current user's email matches the record
  -- This will work when we have proper admin session management
  email = current_setting('app.current_admin_email', true)
);

-- Since we're using a custom admin auth system, we need to ensure
-- the verify_admin_login function can still work (it uses SECURITY DEFINER)
-- The function bypasses RLS, so it will continue to work

-- Also drop any overly permissive update policies and create secure ones
DROP POLICY IF EXISTS "Admin users can update their own record" ON admin_users;

CREATE POLICY "Authenticated admin users can update their own record"
ON admin_users FOR UPDATE
USING (email = current_setting('app.current_admin_email', true))
WITH CHECK (email = current_setting('app.current_admin_email', true));

-- Ensure no INSERT or DELETE policies allow public access
-- Only allow INSERTs through direct database admin access
CREATE POLICY "Restrict public insert on admin_users"
ON admin_users FOR INSERT
WITH CHECK (false);

CREATE POLICY "Restrict public delete on admin_users" 
ON admin_users FOR DELETE
USING (false);