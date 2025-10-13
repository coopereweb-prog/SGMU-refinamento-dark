-- Create the function that will be executed by the trigger
CREATE OR REPLACE FUNCTION public.create_installation_tasks_for_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- The function will run with the permissions of the user that created it
AS $$
BEGIN
  -- This function inserts a new task into the installation_tasks table
  -- for each item associated with the order that was just updated.
  INSERT INTO public.installation_tasks (order_item_id, point_id, status)
  SELECT
    oi.id,
    oi.point_id,
    'pending_art'::public.installation_status -- Sets the initial status for the new task
  FROM
    public.order_items AS oi
  WHERE
    oi.order_id = NEW.id;

  RETURN NEW;
END;
$$;

-- Create the trigger on the 'orders' table
CREATE TRIGGER on_order_completed_create_tasks
-- This trigger will fire AFTER an update operation on the orders table
AFTER UPDATE ON public.orders
FOR EACH ROW
-- The trigger will only run if the status has changed AND the new status is 'completed'
WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed'::public.order_status)
-- Execute the function we created above
EXECUTE FUNCTION public.create_installation_tasks_for_order();

-- Add comments for documentation purposes
COMMENT ON FUNCTION public.create_installation_tasks_for_order() IS 'Automatically creates installation tasks for each item when an order is marked as completed.';
COMMENT ON TRIGGER on_order_completed_create_tasks ON public.orders IS 'Fires after an order is updated to ''completed'' status to create the necessary installation tasks.';