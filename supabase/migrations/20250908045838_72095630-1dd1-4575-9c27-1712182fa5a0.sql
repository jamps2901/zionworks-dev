-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Block public access to client users" ON public.client_users;

-- Recreate the policy
CREATE POLICY "Block public access to client users"
ON public.client_users
FOR ALL
USING (false);

-- Insert demo client user (with conflict handling)
INSERT INTO public.client_users (email, password_hash, company_name, contact_name, phone, is_active) 
VALUES (
  'client@demo.com',
  crypt('demo123', gen_salt('bf')),
  'Demo Company Inc.',
  'John Demo',
  '+1-555-0123',
  true
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  phone = EXCLUDED.phone,
  is_active = EXCLUDED.is_active;