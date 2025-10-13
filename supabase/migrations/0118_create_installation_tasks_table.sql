-- Create a new ENUM type for the installation status to ensure data consistency
CREATE TYPE public.installation_status AS ENUM (
    'pending_art',
    'pending_printing',
    'pending_accessories',
    'ready_for_assignment',
    'assigned',
    'completed',
    'on_hold'
);

-- Create the installation_tasks table to track the entire installation process
CREATE TABLE public.installation_tasks (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    order_item_id uuid NOT NULL,
    point_id uuid NOT NULL,
    assigned_technician_id uuid NULL,
    status public.installation_status NOT NULL DEFAULT 'pending_art',
    completion_photo_url text NULL,
    completion_notes text NULL,
    internal_notes text NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT installation_tasks_pkey PRIMARY KEY (id),
    CONSTRAINT installation_tasks_order_item_id_fkey FOREIGN KEY (order_item_id) REFERENCES public.order_items(id) ON DELETE CASCADE,
    CONSTRAINT installation_tasks_point_id_fkey FOREIGN KEY (point_id) REFERENCES public.points(id) ON DELETE CASCADE,
    CONSTRAINT installation_tasks_assigned_technician_id_fkey FOREIGN KEY (assigned_technician_id) REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Add comments to the columns for better documentation and clarity
COMMENT ON COLUMN public.installation_tasks.status IS 'Tracks the progress of the installation from art approval to completion.';
COMMENT ON COLUMN public.installation_tasks.assigned_technician_id IS 'The field technician assigned to this installation task.';
COMMENT ON COLUMN public.installation_tasks.completion_photo_url IS 'URL of the photo uploaded by the technician upon completion.';
COMMENT ON COLUMN public.installation_tasks.internal_notes IS 'Notes for internal use by the admin/operations team.';

-- Create a trigger to automatically update the updated_at timestamp on any change
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.installation_tasks
FOR EACH ROW
EXECUTE FUNCTION moddatetime (updated_at);

-- Enable Row Level Security on the new table to prepare for access policies
ALTER TABLE public.installation_tasks ENABLE ROW LEVEL SECURITY;