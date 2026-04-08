-- Criação idempotente da tabela points (se ainda não existir)
CREATE TABLE IF NOT EXISTS public.points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    status TEXT CHECK (status IN ('available', 'sold', 'reserved')),
    price_1y NUMERIC(10,2),
    price_2y NUMERIC(10,2),
    price_3y NUMERIC(10,2),
    price_4y NUMERIC(10,2),
    price_5y NUMERIC(10,2),
    pricing_tier_id UUID REFERENCES public.pricing_tiers(id),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Criação da função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criação do trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_points_updated_at ON public.points;
CREATE TRIGGER update_points_updated_at
    BEFORE UPDATE ON public.points
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();