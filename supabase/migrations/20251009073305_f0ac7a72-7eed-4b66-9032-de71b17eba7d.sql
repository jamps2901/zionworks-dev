-- Add status field to project_events for booking confirmations
ALTER TABLE project_events 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Add check constraint for status
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'project_events_status_check'
  ) THEN
    ALTER TABLE project_events 
    ADD CONSTRAINT project_events_status_check 
    CHECK (status IN ('pending', 'confirmed', 'cancelled'));
  END IF;
END $$;

-- Add additional fields for better event management
ALTER TABLE project_events
ADD COLUMN IF NOT EXISTS event_location text,
ADD COLUMN IF NOT EXISTS attendees text[];

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Clients can create events for their projects" ON project_events;
DROP POLICY IF EXISTS "Clients can update events for their projects" ON project_events;

-- Update RLS policies to allow clients to create events
CREATE POLICY "Clients can create events for their projects"
ON project_events
FOR INSERT
WITH CHECK (
  project_id IN (
    SELECT id FROM client_projects WHERE client_id = auth.uid()
  )
);

CREATE POLICY "Clients can update events for their projects"
ON project_events
FOR UPDATE
USING (
  project_id IN (
    SELECT id FROM client_projects WHERE client_id = auth.uid()
  )
);

-- Enable realtime for project_events
ALTER PUBLICATION supabase_realtime ADD TABLE project_events;