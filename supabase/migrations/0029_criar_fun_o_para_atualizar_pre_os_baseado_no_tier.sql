CREATE OR REPLACE FUNCTION public.update_point_prices_from_tier()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o pricing_tier_id foi atualizado
    IF TG_OP = 'UPDATE' AND OLD.pricing_tier_id IS DISTINCT FROM NEW.pricing_tier_id THEN
        -- Busca os preços do tier selecionado
        SELECT 
            price_1y, 
            price_2y, 
            price_3y, 
            price_4y, 
            price_5y
        INTO 
            NEW.price_1y, 
            NEW.price_2y, 
            NEW.price_3y, 
            NEW.price_4y, 
            NEW.price_5y
        FROM public.pricing_tiers 
        WHERE id = NEW.pricing_tier_id;
        
        -- Se não encontrar o tier, mantém os preços atuais
        IF NOT FOUND THEN
            NEW.price_1y := OLD.price_1y;
            NEW.price_2y := OLD.price_2y;
            NEW.price_3y := OLD.price_3y;
            NEW.price_4y := OLD.price_4y;
            NEW.price_5y := OLD.price_5y;
        END IF;
    END IF;
    
    -- Se é INSERT e tem pricing_tier_id
    IF TG_OP = 'INSERT' AND NEW.pricing_tier_id IS NOT NULL THEN
        -- Busca os preços do tier selecionado
        SELECT 
            price_1y, 
            price_2y, 
            price_3y, 
            price_4y, 
            price_5y
        INTO 
            NEW.price_1y, 
            NEW.price_2y, 
            NEW.price_3y, 
            NEW.price_4y, 
            NEW.price_5y
        FROM public.pricing_tiers 
        WHERE id = NEW.pricing_tier_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;