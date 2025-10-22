-- 1. Garante que as colunas de preço existam e sejam NUMERIC
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
END
$$;

-- 2. Limpa dados inconsistentes (substitui vírgulas por pontos e tenta converter para NUMERIC)
UPDATE public.points
SET 
    price_1y = CASE WHEN price_1y IS NOT NULL THEN REPLACE(price_1y::text, ',', '.')::numeric ELSE price_1y END,
    price_2y = CASE WHEN price_2y IS NOT NULL THEN REPLACE(price_2y::text, ',', '.')::numeric ELSE price_2y END,
    price_3y = CASE WHEN price_3y IS NOT NULL THEN REPLACE(price_3y::text, ',', '.')::numeric ELSE price_3y END,
    price_4y = CASE WHEN price_4y IS NOT NULL THEN REPLACE(price_4y::text, ',', '.')::numeric ELSE price_4y END,
    price_5y = CASE WHEN price_5y IS NOT NULL THEN REPLACE(price_5y::text, ',', '.')::numeric ELSE price_5y END
WHERE 
    price_1y::text LIKE '%,%' OR price_2y::text LIKE '%,%' OR price_3y::text LIKE '%,%' OR price_4y::text LIKE '%,%' OR price_5y::text LIKE '%,%';