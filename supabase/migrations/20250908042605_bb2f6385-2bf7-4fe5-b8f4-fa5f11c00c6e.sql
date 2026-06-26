-- Drop existing types if they exist and recreate
DROP TYPE IF EXISTS project_stage CASCADE;
DROP TYPE IF EXISTS approval_status CASCADE;
DROP TYPE IF EXISTS message_type CASCADE;

CREATE TYPE project_stage AS ENUM (
  'initial_brief',
  'scope_agreement', 
  'design_phase',
  'development',
  'testing_uat',
  'go_live',
  'post_support'
);

CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected', 'revision_requested');
CREATE TYPE message_type AS ENUM ('client', 'team', 'system');

-- Client projects table
CREATE TABLE public.client_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  project_name TEXT NOT NULL,
  description TEXT,
  current_stage project_stage DEFAULT 'initial_brief',
  start_date DATE,
  estimated_completion DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Project stages tracking
CREATE TABLE public.project_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  stage_name project_stage NOT NULL,
  status TEXT DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  assigned_team_members TEXT[],
  stage_description TEXT,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  client_approval approval_status DEFAULT 'pending',
  approval_notes TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(project_id, stage_name)
);

-- Project files and documents
CREATE TABLE public.project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  stage_name project_stage,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  uploaded_by UUID NOT NULL,
  uploaded_by_type TEXT NOT NULL,
  description TEXT,
  requires_approval BOOLEAN DEFAULT false,
  approval_status approval_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Project messages/communication
CREATE TABLE public.project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type message_type NOT NULL,
  sender_name TEXT NOT NULL,
  message_text TEXT NOT NULL,
  stage_context project_stage,
  is_important BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Client users table
CREATE TABLE public.client_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  company_name TEXT,
  contact_name TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Project change logs
CREATE TABLE public.project_change_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES client_projects(id) ON DELETE CASCADE,
  change_type TEXT NOT NULL,
  description TEXT NOT NULL,
  changed_by UUID NOT NULL,
  changed_by_type TEXT NOT NULL,
  stage_context project_stage,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_change_logs ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', false);

-- Storage policies
CREATE POLICY "Clients can view files for their projects" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'project-files' AND 
    (storage.foldername(name))[1]::uuid IN (
      SELECT id::text FROM client_projects WHERE client_id = auth.uid()
    )
  );

CREATE POLICY "Clients can upload files to their projects" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'project-files' AND
    (storage.foldername(name))[1]::uuid IN (
      SELECT id::text FROM client_projects WHERE client_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all project files" ON storage.objects
  FOR ALL USING (
    bucket_id = 'project-files' AND
    EXISTS (SELECT 1 FROM admin_users WHERE email = (current_setting('request.jwt.claims', true)::json->>'email'))
  );