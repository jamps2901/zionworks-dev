-- Fix project stages enum to include all needed stages
DO $$ 
BEGIN
    -- Add missing stage values to project_stage enum if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'scope_agreement' AND enumtypid = 'project_stage'::regtype) THEN
        ALTER TYPE project_stage ADD VALUE 'scope_agreement';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'design_phase' AND enumtypid = 'project_stage'::regtype) THEN
        ALTER TYPE project_stage ADD VALUE 'design_phase';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'testing_uat' AND enumtypid = 'project_stage'::regtype) THEN
        ALTER TYPE project_stage ADD VALUE 'testing_uat';
    END IF;
END $$;

-- Create client notifications table
CREATE TABLE IF NOT EXISTS client_notifications (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL,
    project_id UUID,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on notifications
ALTER TABLE client_notifications ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Clients can view their own notifications" 
ON client_notifications 
FOR SELECT 
USING (client_id = auth.uid());

CREATE POLICY "Admins can manage all notifications" 
ON client_notifications 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = (current_setting('request.jwt.claims', true)::json ->> 'email')
));

-- Create project invoices table
CREATE TABLE IF NOT EXISTS project_invoices (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID,
    invoice_number TEXT NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'overdue'
    due_date DATE,
    paid_date DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on invoices
ALTER TABLE project_invoices ENABLE ROW LEVEL SECURITY;

-- Invoice policies
CREATE POLICY "Clients can view invoices for their projects" 
ON project_invoices 
FOR SELECT 
USING (project_id IN (
    SELECT id FROM client_projects 
    WHERE client_id = auth.uid()
));

CREATE POLICY "Admins can manage all invoices" 
ON project_invoices 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = (current_setting('request.jwt.claims', true)::json ->> 'email')
));

-- Add updated_at trigger for invoices
CREATE TRIGGER update_project_invoices_updated_at
    BEFORE UPDATE ON project_invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create project tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID,
    stage_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo', -- 'todo', 'in_progress', 'review', 'completed'
    priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    assigned_to UUID,
    due_date DATE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tasks
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- Task policies
CREATE POLICY "Clients can view tasks for their projects" 
ON project_tasks 
FOR SELECT 
USING (project_id IN (
    SELECT id FROM client_projects 
    WHERE client_id = auth.uid()
));

CREATE POLICY "Admins can manage all tasks" 
ON project_tasks 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM admin_users 
    WHERE email = (current_setting('request.jwt.claims', true)::json ->> 'email')
));

-- Add updated_at trigger for tasks
CREATE TRIGGER update_project_tasks_updated_at
    BEFORE UPDATE ON project_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to send notifications
CREATE OR REPLACE FUNCTION notify_client(
    p_client_id UUID,
    p_project_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO client_notifications (
        client_id, project_id, title, message, type
    ) VALUES (
        p_client_id, p_project_id, p_title, p_message, p_type
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$;