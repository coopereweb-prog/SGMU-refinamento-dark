-- 0001_create_pricing_tiers.sql

-- Cria a nova tabela para os níveis de precificação
CREATE TABLE public.pricing_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    price_1y NUMERIC(10, 2) NOT NULL,
    price_2y NUMERIC(10, 2) NOT NULL,
    price_3y NUMERIC(10, 2) NOT NULL,
    price_4y NUMERIC(10, 2) NOT NULL,
    price_5y NUMERIC(10, 2) NOT NULL,
    description_template TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Adiciona a coluna de chave estrangeira na tabela de pontos
ALTER TABLE public.points
ADD COLUMN pricing_tier_id UUID REFERENCES public.pricing_tiers(id);

-- (Opcional, mas recomendado) Remove as colunas de preço antigas da tabela de pontos
-- Descomente as linhas abaixo se tiver certeza que não precisa mais dos preços antigos
-- ALTER TABLE public.points DROP COLUMN price_1y;
-- ALTER TABLE public.points DROP COLUMN price_2y;
-- ALTER TABLE public.points DROP COLUMN price_3y;
-- ALTER TABLE public.points DROP COLUMN price_4y;
-- ALTER TABLE public.points DROP COLUMN price_5y;

-- Insere os dados iniciais para os níveis de precificação
INSERT INTO public.pricing_tiers (name, price_1y, price_2y, price_3y, price_4y, price_5y, description_template)
VALUES
    ('Ouro', 1500.00, 2800.00, 4000.00, 5000.00, 6000.00, 'Ponto de alta visibilidade em esquina movimentada. Opções de aquisição a partir de R$ {{price_1y}} anuais.'),
    ('Prata', 1200.00, 2200.00, 3100.00, 3900.00, 4600.00, 'Ponto estratégico em avenida de bom fluxo. Opções de aquisição a partir de R$ {{price_1y}} anuais.'),
    ('Bronze', 900.00, 1600.00, 2200.00, 2700.00, 3100.00, 'Ponto com boa exposição em rua comercial. Opções de aquisição a partir de R$ {{price_1y}} anuais.');