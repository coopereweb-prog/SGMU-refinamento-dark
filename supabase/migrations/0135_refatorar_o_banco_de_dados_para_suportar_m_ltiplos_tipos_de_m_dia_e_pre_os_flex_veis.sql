-- Fase 1.1: Adicionar a coluna media_type à tabela points
-- Define um tipo ENUM para garantir a consistência dos dados
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type_enum') THEN
        CREATE TYPE public.media_type_enum AS ENUM ('static_panel', 'outdoor', 'led_panel');
    END IF;
END$$;

-- Adiciona a coluna com um valor padrão para os pontos existentes
ALTER TABLE public.points
ADD COLUMN IF NOT EXISTS media_type public.media_type_enum NOT NULL DEFAULT 'static_panel';

-- Fase 1.2 (adiada): Criar a nova tabela tier_prices
CREATE TABLE IF NOT EXISTS public.tier_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tier_id UUID NOT NULL REFERENCES public.pricing_tiers(id) ON DELETE CASCADE,
    period_days INTEGER NOT NULL,
    period_label TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tier_id, period_days) -- Garante que não haja períodos duplicados para o mesmo tier
);

-- Habilita RLS na nova tabela
ALTER TABLE public.tier_prices ENABLE ROW LEVEL SECURITY;

-- Cria políticas de segurança para a nova tabela
DROP POLICY IF EXISTS "Public can read tier prices" ON public.tier_prices;
CREATE POLICY "Public can read tier prices" ON public.tier_prices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage tier prices" ON public.tier_prices;
CREATE POLICY "Admins can manage tier prices" ON public.tier_prices FOR ALL
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- Cria um trigger para atualizar 'updated_at'
CREATE OR REPLACE TRIGGER update_tier_prices_updated_at
BEFORE UPDATE ON public.tier_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Fase 1.3: Migrar os dados de preços existentes
-- Limpa a tabela antes de inserir para evitar duplicatas em caso de re-execução
TRUNCATE public.tier_prices;

-- Migra os preços de 1 ano
INSERT INTO public.tier_prices (tier_id, period_days, period_label, price)
SELECT id, 365, '1 Ano', price_1y FROM public.pricing_tiers WHERE price_1y > 0;

-- Migra os preços de 2 anos
INSERT INTO public.tier_prices (tier_id, period_days, period_label, price)
SELECT id, 730, '2 Anos', price_2y FROM public.pricing_tiers WHERE price_2y > 0;

-- Migra os preços de 3 anos
INSERT INTO public.tier_prices (tier_id, period_days, period_label, price)
SELECT id, 1095, '3 Anos', price_3y FROM public.pricing_tiers WHERE price_3y > 0;

-- Migra os preços de 4 anos
INSERT INTO public.tier_prices (tier_id, period_days, period_label, price)
SELECT id, 1460, '4 Anos', price_4y FROM public.pricing_tiers WHERE price_4y > 0;

-- Migra os preços de 5 anos
INSERT INTO public.tier_prices (tier_id, period_days, period_label, price)
SELECT id, 1825, '5 Anos', price_5y FROM public.pricing_tiers WHERE price_5y > 0;

-- Fase 1.4: Remover as colunas de preço antigas da tabela pricing_tiers
ALTER TABLE public.pricing_tiers
DROP COLUMN IF EXISTS price_1y,
DROP COLUMN IF EXISTS price_2y,
DROP COLUMN IF EXISTS price_3y,
DROP COLUMN IF EXISTS price_4y,
DROP COLUMN IF EXISTS price_5y;