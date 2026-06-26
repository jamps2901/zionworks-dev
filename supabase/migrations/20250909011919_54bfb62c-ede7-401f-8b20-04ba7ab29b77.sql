-- Fix chat security vulnerability by implementing proper RLS policies

-- First, let's add a customer_id column to track who created the chat session
ALTER TABLE public.chat_sessions ADD COLUMN IF NOT EXISTS customer_id uuid;

-- Update existing chat_sessions RLS policies for better security
DROP POLICY IF EXISTS "Anyone can create chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Admin users can view all chat sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Admin users can update chat sessions" ON public.chat_sessions;

-- Create more secure policies for chat_sessions
CREATE POLICY "Users can create their own chat sessions" 
ON public.chat_sessions 
FOR INSERT 
WITH CHECK (
  -- Allow creation if customer_id matches authenticated user or if no customer_id is set (for anonymous users)
  customer_id IS NULL OR customer_id = auth.uid()
);

CREATE POLICY "Admins can view all chat sessions" 
ON public.chat_sessions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = ((current_setting('request.jwt.claims', true))::json ->> 'email')
  )
);

CREATE POLICY "Chat participants can view their own sessions" 
ON public.chat_sessions 
FOR SELECT 
USING (
  customer_id = auth.uid() OR 
  (customer_id IS NULL AND customer_email = ((current_setting('request.jwt.claims', true))::json ->> 'email'))
);

CREATE POLICY "Admins can update chat sessions" 
ON public.chat_sessions 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = ((current_setting('request.jwt.claims', true))::json ->> 'email')
  )
);

-- Update chat_messages RLS policies for better security
DROP POLICY IF EXISTS "Anyone can create chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Admin users can view all chat messages" ON public.chat_messages;

-- Create more secure policies for chat_messages
CREATE POLICY "Users can create messages in their own chat sessions" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  -- Allow if user is admin or if session belongs to the user
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = ((current_setting('request.jwt.claims', true))::json ->> 'email')
  ) OR
  EXISTS (
    SELECT 1 FROM chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND (
      chat_sessions.customer_id = auth.uid() OR 
      (chat_sessions.customer_id IS NULL AND chat_sessions.customer_email = ((current_setting('request.jwt.claims', true))::json ->> 'email'))
    )
  )
);

CREATE POLICY "Admins can view all chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = ((current_setting('request.jwt.claims', true))::json ->> 'email')
  )
);

CREATE POLICY "Chat participants can view their own messages" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM chat_sessions 
    WHERE chat_sessions.id = chat_messages.session_id 
    AND (
      chat_sessions.customer_id = auth.uid() OR 
      (chat_sessions.customer_id IS NULL AND chat_sessions.customer_email = ((current_setting('request.jwt.claims', true))::json ->> 'email'))
    )
  )
);

-- Create an index for better performance on the new customer_id column
CREATE INDEX IF NOT EXISTS idx_chat_sessions_customer_id ON public.chat_sessions(customer_id);

-- Add a function to get current user email for anonymous users
CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS TEXT AS $$
BEGIN
  RETURN ((current_setting('request.jwt.claims', true))::json ->> 'email');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;