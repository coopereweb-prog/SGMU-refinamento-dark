DROP TRIGGER IF EXISTS on_order_status_change ON public.orders;
CREATE TRIGGER on_order_status_change
AFTER UPDATE ON public.orders
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.reserved_until IS DISTINCT FROM NEW.reserved_until)
EXECUTE FUNCTION public.notify_on_order_status_change();