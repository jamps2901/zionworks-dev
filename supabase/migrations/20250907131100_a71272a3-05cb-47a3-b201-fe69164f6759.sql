-- Fix chat sessions security - restrict access to admin users only
-- Remove the current overly permissive policy
DROP POLICY IF EXISTS "Chat sessions are viewable by everyone" ON public.chat_sessions;

-- Create new secure policies for chat sessions
-- Only admin users can view all chat sessions (for support purposes)
CREATE POLICY "Admin users can view all chat sessions" 
ON public.chat_sessions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
  )
);

-- Admin users can update chat sessions (change status, etc.)
CREATE POLICY "Admin users can update chat sessions" 
ON public.chat_sessions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
  )
);

-- The existing insert policy is fine - anyone can create a new chat session
-- This is needed for customers to start live chat support

-- Similarly, update chat_messages to be more secure
-- Remove overly permissive read policy if it exists
DROP POLICY IF EXISTS "Chat messages are viewable by everyone" ON public.chat_messages;

-- Admin users can view all chat messages (for support)
CREATE POLICY "Admin users can view all chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users 
    WHERE email = current_setting('request.jwt.claims', true)::json->>'email'
  )
);

-- The existing insert policy is fine - anyone can create chat messages
-- This allows both customers and admins to send messages