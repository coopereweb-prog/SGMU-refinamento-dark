-- Criar tabela pricing_tiers
CREATE TABLE IF NOT EXISTS public.pricing_tiers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price_1y NUMERIC NOT NULL DEFAULT 0,
  price_2y NUMERIC NOT NULL DEFAULT 0,
  price_3y NUMERIC NOT NULL DEFAULT 0,
  price_4y NUMERIC NOT NULL DEFAULT 0,
  price_5y NUMERIC NOT NULL DEFAULT 0,
  description_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);