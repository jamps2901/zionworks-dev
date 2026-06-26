-- Remove the overly permissive update policy for chat sessions
DROP POLICY IF EXISTS "Anyone can update chat sessions" ON public.chat_sessions;