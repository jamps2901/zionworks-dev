-- Fix chat_sessions RLS to prevent public exposure of customer contact information
-- Drop the overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view their own chat sessions" ON chat_sessions;
DROP POLICY IF EXISTS "Chat participants can view their own sessions" ON chat_sessions;

-- Only admins can view chat sessions (contains sensitive customer contact info)
CREATE POLICY "Only admins can view chat sessions"
ON chat_sessions
FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = get_current_user_email()
  )
);

-- Keep the insert policy for anonymous users to start live chat
-- (Already exists: "Allow anyone to create chat sessions")

-- Only admins can update chat sessions
DROP POLICY IF EXISTS "Admins can update chat sessions" ON chat_sessions;

CREATE POLICY "Only admins can update chat sessions"
ON chat_sessions
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = get_current_user_email()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = get_current_user_email()
  )
);

-- Ensure chat_messages can be viewed by session participants
-- (This is what customers actually need to see their messages, not the sessions table)
DROP POLICY IF EXISTS "Chat participants can view their own messages" ON chat_messages;

CREATE POLICY "Customers can view messages in their session"
ON chat_messages
FOR SELECT
TO public
USING (
  -- Admins can see all messages
  EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = get_current_user_email()
  )
  OR
  -- Customers can see messages in sessions they created (matched by email)
  EXISTS (
    SELECT 1 FROM chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id
    AND chat_sessions.customer_email = get_current_user_email()
  )
);