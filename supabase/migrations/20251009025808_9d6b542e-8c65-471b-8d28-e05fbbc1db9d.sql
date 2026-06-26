-- Fix chat sessions RLS policy to allow anonymous users to create sessions
DROP POLICY IF EXISTS "Users can create their own chat sessions" ON chat_sessions;

-- Allow anyone to create a chat session (for anonymous users starting live chat)
CREATE POLICY "Allow anyone to create chat sessions"
ON chat_sessions
FOR INSERT
TO public
WITH CHECK (true);

-- Update the existing select policy to allow users to see their own sessions by email as well
DROP POLICY IF EXISTS "Chat participants can view their own sessions" ON chat_sessions;

CREATE POLICY "Users can view their own chat sessions"
ON chat_sessions
FOR SELECT
TO public
USING (
  (customer_id IS NOT NULL AND customer_id = auth.uid()) 
  OR 
  (customer_email IS NOT NULL AND customer_email = get_current_user_email())
  OR
  customer_id IS NULL  -- Allow viewing of sessions without user_id (anonymous)
);