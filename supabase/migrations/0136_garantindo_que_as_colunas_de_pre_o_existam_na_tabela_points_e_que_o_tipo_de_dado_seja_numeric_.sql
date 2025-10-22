-- 1. Adiciona as colunas de preço se elas não existirem (ou garante que são numeric)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='points' AND column_name='price_1y') THEN
        ALTER TABLE public.points ADD COLUMN price_1y NUMERIC DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='points' AND column_name='price_2y') THEN
        ALTER TABLE public.points ADD COLUMN price_2y NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='points' AND column_name='price_3y') THEN
        ALTER TABLE public.points ADD COLUMN price_3y NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='points' AND column_name='price_4y') THEN
        ALTER TABLE public.points ADD COLUMN price_4y NUMERIC;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='points' AND column_name='price_5y') THEN
        ALTER TABLE public.points ADD COLUMN price_5y NUMERIC;
    END IF;
    
    -- 2. Garante que as colunas de coordenadas são NUMERIC (para aceitar ponto decimal)
    ALTER TABLE public.points ALTER COLUMN latitude TYPE NUMERIC USING latitude::NUMERIC;
    ALTER TABLE public.points ALTER COLUMN longitude TYPE NUMERIC USING longitude::NUMERIC;
    
    -- 3. Garante que a coluna media_type existe e tem o tipo correto
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='points' AND column_name='media_type') THEN
        ALTER TABLE public.points ADD COLUMN media_type media_type_enum DEFAULT 'static_panel'::media_type_enum;
    END IF;
END
$$;