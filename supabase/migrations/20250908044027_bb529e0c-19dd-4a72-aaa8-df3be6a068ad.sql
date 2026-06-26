-- Insert test client user for demo purposes
INSERT INTO client_users (email, password_hash, company_name, contact_name, phone, is_active) 
VALUES (
  'client@demo.com',
  crypt('demo123', gen_salt('bf')),
  'Demo Company Inc.',
  'John Demo',
  '+1-555-0123',
  true
);

-- Insert a sample project for the demo client
INSERT INTO client_projects (client_id, project_name, description, current_stage, start_date, estimated_completion)
SELECT 
  id,
  'Company Website Redesign',
  'Modern responsive website with enhanced user experience and SEO optimization',
  'development'::project_stage,
  '2024-01-15'::date,
  '2024-03-01'::date
FROM client_users WHERE email = 'client@demo.com';