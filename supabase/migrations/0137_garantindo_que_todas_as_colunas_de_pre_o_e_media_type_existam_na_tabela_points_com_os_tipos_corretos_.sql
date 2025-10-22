-- 1. Adicionar colunas de preço (se não existirem)
ALTER TABLE public.points
ADD COLUMN IF NOT EXISTS price_1y NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS price_2y NUMERIC,
ADD COLUMN IF NOT EXISTS price_3y NUMERIC,
ADD COLUMN IF NOT EXISTS price_4y NUMERIC,
ADD COLUMN IF NOT EXISTS price_5y NUMERIC;

-- 2. Adicionar a coluna media_type (se não existir)
-- Assumindo que o tipo 'media_type_enum' já existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='points' AND column_name='media_type') THEN
        ALTER TABLE public.points ADD COLUMN media_type media_type_enum NOT NULL DEFAULT 'static_panel';
    END IF;
END
$$;

-- 3. Adicionar a coluna description (se não existir)
ALTER TABLE public.points
ADD COLUMN IF NOT EXISTS description TEXT;

-- 4. Adicionar a coluna pricing_tier_id (se não existir)
ALTER TABLE public.points
ADD COLUMN IF NOT EXISTS pricing_tier_id UUID REFERENCES public.pricing_tiers(id);