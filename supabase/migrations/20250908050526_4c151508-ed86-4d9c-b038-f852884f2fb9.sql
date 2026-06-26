-- Create a new test client user with fresh credentials
INSERT INTO public.client_users (email, password_hash, company_name, contact_name, phone, is_active) 
VALUES (
  'testclient@example.com',
  crypt('password123', gen_salt('bf')),
  'Test Client Company',
  'Jane Smith',
  '+1-555-9999',
  true
) ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  company_name = EXCLUDED.company_name,
  contact_name = EXCLUDED.contact_name,
  phone = EXCLUDED.phone,
  is_active = EXCLUDED.is_active;