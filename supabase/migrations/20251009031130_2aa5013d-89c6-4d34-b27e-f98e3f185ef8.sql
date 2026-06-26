-- ===============================================
-- CRITICAL SECURITY FIX: Admin Authentication System
-- ===============================================
-- This migration addresses the "Admin Account Credentials Could Be Stolen" security issue
-- by migrating from custom admin_users table to Supabase Auth with proper RBAC

-- Step 1: Create the app_role enum for proper role management
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'client');

-- Step 2: Create user_roles table for RBAC (separate from user data - security best practice)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 3: Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Step 4: Create helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

-- Step 5: RLS policies for user_roles table
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Step 6: Drop the insecure verify_admin_login function (contains hardcoded credentials)
DROP FUNCTION IF EXISTS public.verify_admin_login(text, text);

-- Step 7: Create migration helper function to assign admin role after signup
-- This will be used temporarily during migration, then can be removed
CREATE OR REPLACE FUNCTION public.assign_admin_role_to_email(admin_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Find the user by email in auth.users
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = admin_email
  LIMIT 1;
  
  IF admin_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', admin_email;
  END IF;
  
  -- Insert admin role if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (admin_user_id, 'admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN admin_user_id;
END;
$$;

-- Step 8: Update RLS policies on admin-protected tables to use new role system
-- Update blog_posts policies
DROP POLICY IF EXISTS "Block public delete on blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Block public insert on blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Block public update on blog posts" ON public.blog_posts;

CREATE POLICY "Only admins can insert blog posts"
ON public.blog_posts
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update blog posts"
ON public.blog_posts
FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Only admins can delete blog posts"
ON public.blog_posts
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Update services policies
DROP POLICY IF EXISTS "Block public delete on services" ON public.services;
DROP POLICY IF EXISTS "Block public insert on services" ON public.services;
DROP POLICY IF EXISTS "Block public update on services" ON public.services;

CREATE POLICY "Only admins can insert services"
ON public.services
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update services"
ON public.services
FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Only admins can delete services"
ON public.services
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Update chat_sessions policies to use new role system
DROP POLICY IF EXISTS "Admins can view all chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Only admins can view chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Only admins can update chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Admins can update chat sessions" ON public.chat_sessions;

CREATE POLICY "Only admins can view chat sessions"
ON public.chat_sessions
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Only admins can update chat sessions"
ON public.chat_sessions
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Update chat_messages policies to use new role system
DROP POLICY IF EXISTS "Admins can view all chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Customers can view messages in their session" ON public.chat_messages;

CREATE POLICY "Chat participants can view messages"
ON public.chat_messages
FOR SELECT
TO public
USING (
  -- Admins can see all messages
  (auth.uid() IS NOT NULL AND public.is_admin())
  OR
  -- Customers can see messages in sessions they created (matched by email)
  EXISTS (
    SELECT 1 FROM public.chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id
    AND chat_sessions.customer_email = public.get_current_user_email()
  )
);

-- Step 9: Update other admin-restricted policies to use role system
-- Update client_intake_requests
DROP POLICY IF EXISTS "Admins can manage intake requests" ON public.client_intake_requests;

CREATE POLICY "Admins can manage intake requests"
ON public.client_intake_requests
FOR ALL
TO authenticated
USING (public.is_admin());

-- Update client_users policies
DROP POLICY IF EXISTS "Allow admins to view client users" ON public.client_users;
DROP POLICY IF EXISTS "Allow admins to insert client users" ON public.client_users;
DROP POLICY IF EXISTS "Allow admins to update client users" ON public.client_users;
DROP POLICY IF EXISTS "Allow admins to delete client users" ON public.client_users;

CREATE POLICY "Admins can view all client users"
ON public.client_users
FOR SELECT
TO authenticated
USING (public.is_admin() OR auth.uid() = id);

CREATE POLICY "Admins can insert client users"
ON public.client_users
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update client users"
ON public.client_users
FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins can delete client users"
ON public.client_users
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Update client_projects policies
DROP POLICY IF EXISTS "Admins can manage projects" ON public.client_projects;
DROP POLICY IF EXISTS "Admins can view all projects" ON public.client_projects;

CREATE POLICY "Admins can manage all projects"
ON public.client_projects
FOR ALL
TO authenticated
USING (public.is_admin());

-- Update client_notifications policies
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.client_notifications;

CREATE POLICY "Admins can manage all notifications"
ON public.client_notifications
FOR ALL
TO authenticated
USING (public.is_admin());

-- Update project tables to use new role system
DROP POLICY IF EXISTS "Admins can view all change logs" ON public.project_change_logs;
CREATE POLICY "Admins can view all change logs"
ON public.project_change_logs
FOR SELECT
TO authenticated
USING (public.is_admin() OR project_id IN (
  SELECT id FROM public.client_projects WHERE client_id = auth.uid()
));

DROP POLICY IF EXISTS "Admins can manage all project files" ON public.project_files;
CREATE POLICY "Admins can manage all project files"
ON public.project_files
FOR ALL
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all invoices" ON public.project_invoices;
CREATE POLICY "Admins can manage all invoices"
ON public.project_invoices
FOR ALL
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all project messages" ON public.project_messages;
CREATE POLICY "Admins can manage all project messages"
ON public.project_messages
FOR ALL
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all project stages" ON public.project_stages;
CREATE POLICY "Admins can manage all project stages"
ON public.project_stages
FOR ALL
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all tasks" ON public.project_tasks;
CREATE POLICY "Admins can manage all tasks"
ON public.project_tasks
FOR ALL
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage all team members" ON public.project_team_members;
CREATE POLICY "Admins can manage all team members"
ON public.project_team_members
FOR ALL
TO authenticated
USING (public.is_admin());

-- Step 10: Mark admin_users table as deprecated (will be removed after migration)
-- Add a comment to the table explaining it should not be used
COMMENT ON TABLE public.admin_users IS 'DEPRECATED: This table is no longer used. Admin authentication now uses Supabase Auth with user_roles table. This table will be dropped in a future migration after data migration is complete.';

-- Step 11: Create function to update is_admin() that was referenced in other places
-- Update the old is_admin function to use new role system
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role);
$$;