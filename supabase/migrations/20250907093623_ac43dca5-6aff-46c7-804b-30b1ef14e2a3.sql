-- Fix the critical security vulnerability by properly securing admin_users table

-- Drop ALL existing policies on admin_users table first
DROP POLICY IF EXISTS "Admin users can view their own record" ON admin_users;
DROP POLICY IF EXISTS "Authenticated admin users can view their own record" ON admin_users;
DROP POLICY IF EXISTS "Admin users can update their own record" ON admin_users;
DROP POLICY IF EXISTS "Authenticated admin users can update their own record" ON admin_users;
DROP POLICY IF EXISTS "Restrict public insert on admin_users" ON admin_users;
DROP POLICY IF EXISTS "Restrict public delete on admin_users" ON admin_users;

-- Create secure restrictive policies
-- IMPORTANT: These policies block public access completely
-- The verify_admin_login function will still work because it uses SECURITY DEFINER

-- Block all public SELECT access (no one can read admin emails/passwords)
CREATE POLICY "Block public access to admin_users"
ON admin_users FOR SELECT
USING (false);

-- Block all public modifications  
CREATE POLICY "Block public insert on admin_users"
ON admin_users FOR INSERT
WITH CHECK (false);

CREATE POLICY "Block public update on admin_users"
ON admin_users FOR UPDATE 
USING (false)
WITH CHECK (false);

CREATE POLICY "Block public delete on admin_users"
ON admin_users FOR DELETE
USING (false);