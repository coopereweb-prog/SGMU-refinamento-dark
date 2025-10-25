CREATE OR REPLACE FUNCTION public.update_point_prices_from_tier()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_tier_id UUID;
BEGIN
    -- Determina o ID do tier a ser usado (NEW para INSERT/UPDATE)
    v_tier_id := NEW.pricing_tier_id;

    -- Apenas executa se houver um pricing_tier_id
    IF v_tier_id IS NOT NULL THEN
        -- Busca e atribui o preço de 1 ano (365 dias)
        SELECT price INTO NEW.price_1y
        FROM public.tier_prices
        WHERE tier_id = v_tier_id AND period_days = 365;

        -- Busca e atribui o preço de 2 anos (730 dias)
        SELECT price INTO NEW.price_2y
        FROM public.tier_prices
        WHERE tier_id = v_tier_id AND period_days = 730;

        -- Busca e atribui o preço de 3 anos (1095 dias)
        SELECT price INTO NEW.price_3y
        FROM public.tier_prices
        WHERE tier_id = v_tier_id AND period_days = 1095;

        -- Busca e atribui o preço de 4 anos (1460 dias)
        SELECT price INTO NEW.price_4y
        FROM public.tier_prices
        WHERE tier_id = v_tier_id AND period_days = 1460;

        -- Busca e atribui o preço de 5 anos (1825 dias)
        SELECT price INTO NEW.price_5y
        FROM public.tier_prices
        WHERE tier_id = v_tier_id AND period_days = 1825;
    ELSE
        -- Se não houver tier, define os preços como NULL ou 0 (mantendo o padrão da coluna)
        NEW.price_1y := 0;
        NEW.price_2y := NULL;
        NEW.price_3y := NULL;
        NEW.price_4y := NULL;
        NEW.price_5y := NULL;
    END IF;
    
    RETURN NEW;
END;
$function$;