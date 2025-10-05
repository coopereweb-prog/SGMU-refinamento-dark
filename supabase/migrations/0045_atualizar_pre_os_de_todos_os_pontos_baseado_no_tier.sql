UPDATE public.points p
SET 
    price_1y = pt.price_1y,
    price_2y = pt.price_2y,
    price_3y = pt.price_3y,
    price_4y = pt.price_4y,
    price_5y = pt.price_5y
FROM public.pricing_tiers pt
WHERE p.pricing_tier_id = pt.id;