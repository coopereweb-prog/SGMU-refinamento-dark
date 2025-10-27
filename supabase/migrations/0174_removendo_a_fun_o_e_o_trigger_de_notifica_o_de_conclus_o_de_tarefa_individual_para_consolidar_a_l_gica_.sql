DROP TRIGGER IF EXISTS on_single_task_completion ON public.installation_tasks;
DROP FUNCTION IF EXISTS public.notify_on_single_task_completion();