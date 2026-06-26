-- Update admin credentials to the new email and password
UPDATE admin_users 
SET 
  email = 'jrpatnugot29@gmail.com',
  password_hash = crypt('Patjo@1981', gen_salt('bf')),
  updated_at = now()
WHERE email = 'admin@zionworks.co.nz';

-- If no rows were updated, insert the new admin user
INSERT INTO admin_users (email, name, password_hash) 
SELECT 'jrpatnugot29@gmail.com', 'Administrator', crypt('Patjo@1981', gen_salt('bf'))
WHERE NOT EXISTS (SELECT 1 FROM admin_users WHERE email = 'jrpatnugot29@gmail.com');