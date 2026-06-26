-- ===============================================
-- CRITICAL FIX: Live Chat + Admin Access Restoration
-- ===============================================

-- 1. FIX LIVE CHAT: Make chat_sessions INSERT policy explicitly PERMISSIVE
--    The previous policy may have been created as RESTRICTIVE by default
DROP POLICY IF EXISTS "Allow anyone to create chat sessions" ON public.chat_sessions;

CREATE POLICY "Allow anyone to create chat sessions"
ON public.chat_sessions
AS PERMISSIVE  -- Explicitly set as PERMISSIVE
FOR INSERT
TO public
WITH CHECK (true);

-- 2. FIX ADMIN LOGIN: Assign admin role to jrpatnugot29@gmail.com
--    This user was migrated to auth.users but role wasn't assigned
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'jrpatnugot29@gmail.com'),
  'admin'::public.app_role
)
ON CONFLICT (user_id, role) DO NOTHING;

-- 3. VERIFY: Add helpful comment
COMMENT ON POLICY "Allow anyone to create chat sessions" ON public.chat_sessions IS
'PERMISSIVE policy allowing anonymous users to create live chat sessions. Critical for customer support functionality.';