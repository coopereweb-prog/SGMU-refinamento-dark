DROP TRIGGER IF EXISTS update_point_prices_trigger ON public.points;
CREATE TRIGGER update_point_prices_trigger
    BEFORE INSERT OR UPDATE ON public.points
    FOR EACH ROW
    EXECUTE FUNCTION public.update_point_prices_from_tier();