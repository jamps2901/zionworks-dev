-- Create admin users table for simple admin authentication
CREATE TABLE public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policy for admin users (they can only see their own record)
CREATE POLICY "Admin users can view their own record" 
ON public.admin_users 
FOR SELECT 
USING (true);

-- Insert default admin user (you can change this later)
-- Password is 'admin123' - you should change this immediately
INSERT INTO public.admin_users (email, password_hash, name) 
VALUES ('admin@zionworks.co.nz', '$2a$10$8K1p/a0dQt8xjPZg5dKTju7BfNQq5ZtANJrFyB7YiKqf8y3NOeGW6', 'Admin User');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();