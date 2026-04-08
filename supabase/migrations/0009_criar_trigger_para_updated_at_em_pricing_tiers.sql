-- Cria/atualiza a função update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recria o trigger de forma idempotente
DROP TRIGGER IF EXISTS update_pricing_tiers_updated_at ON public.pricing_tiers;
CREATE TRIGGER update_pricing_tiers_updated_at
  BEFORE UPDATE ON public.pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();