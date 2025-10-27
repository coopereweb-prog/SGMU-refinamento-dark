DROP TRIGGER IF EXISTS on_single_task_completion ON public.installation_tasks;
CREATE TRIGGER on_single_task_completion
  AFTER UPDATE ON public.installation_tasks
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'completed')
  EXECUTE FUNCTION public.notify_on_single_task_completion();