-- Create secure functions for admin dashboard access to customer data
-- These functions use SECURITY DEFINER to bypass RLS for authorized admin access

-- Function to get all quotes for admin dashboard
CREATE OR REPLACE FUNCTION get_admin_quotes()
RETURNS TABLE (
  id bigint,
  created_at timestamptz,
  name text,
  email text,
  project_type text,
  timeline text,
  budget text,
  message text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, created_at, name, email, project_type, timeline, budget, message
  FROM quotes
  ORDER BY created_at DESC;
$$;

-- Function to get all contacts for admin dashboard  
CREATE OR REPLACE FUNCTION get_admin_contacts()
RETURNS TABLE (
  id bigint,
  created_at timestamptz,
  name text,
  email text,
  phone text,
  message text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, created_at, name, email, phone, message
  FROM contacts
  ORDER BY created_at DESC;
$$;

-- Function to get all bookings for admin dashboard
CREATE OR REPLACE FUNCTION get_admin_bookings()
RETURNS TABLE (
  id bigint,
  created_at timestamptz,
  name text,
  email text,
  method text,
  preferred_time timestamp,
  notes text
)
LANGUAGE sql  
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, created_at, name, email, method, preferred_time, notes
  FROM bookings
  ORDER BY created_at DESC;
$$;