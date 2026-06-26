-- Create the client_users table with proper structure
CREATE TABLE IF NOT EXISTS public.client_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  company_name TEXT,
  contact_name TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;

-- Create policy to block public access (only functions can access)
CREATE POLICY "Block public access to client users"
ON public.client_users
FOR ALL
USING (false);

-- Insert demo client user
INSERT INTO public.client_users (email, password_hash, company_name, contact_name, phone, is_active) 
VALUES (
  'client@demo.com',
  crypt('demo123', gen_salt('bf')),
  'Demo Company Inc.',
  'John Demo',
  '+1-555-0123',
  true
) ON CONFLICT (email) DO NOTHING;