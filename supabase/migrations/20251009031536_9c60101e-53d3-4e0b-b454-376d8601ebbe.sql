-- ===============================================
-- CRITICAL SECURITY FIX: Secure admin_users table
-- ===============================================
-- Addresses the "Admin Credentials Could Be Stolen" security issue
-- The admin_users table is deprecated but still contains sensitive data
-- This migration ensures ONLY admins can access it

-- Step 1: Drop all existing blocking policies (they only block public, not authenticated users)
DROP POLICY IF EXISTS "Block public access to admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Block public delete on admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Block public insert on admin_users" ON public.admin_users;
DROP POLICY IF EXISTS "Block public update on admin_users" ON public.admin_users;

-- Step 2: Create explicit admin-only policies
-- Only admins can SELECT from admin_users
CREATE POLICY "Only admins can view admin_users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Only admins can INSERT into admin_users
CREATE POLICY "Only admins can insert admin_users"
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Only admins can UPDATE admin_users
CREATE POLICY "Only admins can update admin_users"
ON public.admin_users
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Only admins can DELETE from admin_users
CREATE POLICY "Only admins can delete admin_users"
ON public.admin_users
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Block all public (unauthenticated) access
CREATE POLICY "Block all public access to admin_users"
ON public.admin_users
FOR ALL
TO public
USING (false);

-- Step 3: Add comment explaining the table is deprecated and will be removed
COMMENT ON TABLE public.admin_users IS 
'DEPRECATED - DO NOT USE: This table is no longer used for authentication. 
Admin authentication now uses Supabase Auth with the user_roles table. 
This table is kept temporarily for migration purposes only and will be dropped 
in a future migration once all data is confirmed migrated. 
Access is restricted to admins only via RLS policies.';