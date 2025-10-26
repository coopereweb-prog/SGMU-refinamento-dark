DROP TRIGGER IF EXISTS on_task_status_change ON public.installation_tasks;
CREATE TRIGGER on_task_status_change
AFTER UPDATE ON public.installation_tasks
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status <> 'completed')
EXECUTE FUNCTION public.notify_on_task_status_change();