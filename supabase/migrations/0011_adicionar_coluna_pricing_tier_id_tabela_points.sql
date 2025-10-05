DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'points' AND column_name = 'pricing_tier_id'
    ) THEN
        ALTER TABLE public.points ADD COLUMN pricing_tier_id UUID REFERENCES public.pricing_tiers(id);
        
        -- Atualizar pontos existentes com um pricing_tier_id padrão (Bronze)
        UPDATE public.points SET pricing_tier_id = (SELECT id FROM public.pricing_tiers WHERE name = 'Bronze' LIMIT 1) 
        WHERE pricing_tier_id IS NULL;
        
        RAISE NOTICE 'Coluna pricing_tier_id adicionada com sucesso à tabela points';
    ELSE
        RAISE NOTICE 'Coluna pricing_tier_id já existe na tabela points';
    END IF;
END $$;