-- Remove triggers antigos se existirem
DROP TRIGGER IF EXISTS update_point_prices_trigger ON public.points;

-- Cria o trigger para INSERT
CREATE TRIGGER update_point_prices_trigger
BEFORE INSERT OR UPDATE OF pricing_tier_id ON public.points
FOR EACH ROW EXECUTE FUNCTION public.update_point_prices_from_tier();