-- ===============================================
-- FIX: Update chat policies to use user_roles instead of admin_users
-- ===============================================
-- This ensures chat security works with the new RBAC system
-- and removes references to the deprecated admin_users table

-- Drop old policies on chat_messages
DROP POLICY IF EXISTS "Users can create messages in their own chat sessions" ON public.chat_messages;

-- Create new policy for inserting messages
-- Allows: admins via user_roles OR customers in their own sessions (authenticated or anonymous via email)
CREATE POLICY "Users can create messages in their own chat sessions"
ON public.chat_messages
FOR INSERT
TO public
WITH CHECK (
  -- Admins can create messages
  public.is_admin()
  OR
  -- Customers can create messages in their own sessions
  (
    EXISTS (
      SELECT 1
      FROM public.chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
        AND (
          -- Authenticated customer
          (chat_sessions.customer_id = auth.uid())
          OR
          -- Anonymous customer (matched by email from JWT)
          (
            chat_sessions.customer_id IS NULL 
            AND chat_sessions.customer_email = (
              (current_setting('request.jwt.claims'::text, true))::json ->> 'email'::text
            )
          )
        )
    )
  )
);

-- Add comment explaining the security model
COMMENT ON POLICY "Users can create messages in their own chat sessions" ON public.chat_messages IS
'Allows admins (via is_admin()) and customers (authenticated via customer_id or anonymous via customer_email) to create messages in their own chat sessions. Anonymous users can still use live chat by providing email.';

-- Verify chat_sessions policies are correct
-- These should already be set, but let's ensure they're explicit

-- Ensure anyone can create chat sessions (needed for anonymous live chat)
DROP POLICY IF EXISTS "Allow anyone to create chat sessions" ON public.chat_sessions;
CREATE POLICY "Allow anyone to create chat sessions"
ON public.chat_sessions
FOR INSERT
TO public
WITH CHECK (true);

-- Only admins can view chat sessions
DROP POLICY IF EXISTS "Only admins can view chat sessions" ON public.chat_sessions;
CREATE POLICY "Only admins can view chat sessions"
ON public.chat_sessions
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Only admins can update chat sessions
DROP POLICY IF EXISTS "Only admins can update chat sessions" ON public.chat_sessions;
CREATE POLICY "Only admins can update chat sessions"
ON public.chat_sessions
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());