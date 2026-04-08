SELECT 
    p.id, 
    p.name, 
    p.status, 
    pt.name as tier_name,
    p.price_1y,
    p.price_2y,
    p.price_3y,
    p.price_4y,
    p.price_5y
FROM public.points p
LEFT JOIN public.pricing_tiers pt ON p.pricing_tier_id = pt.id
ORDER BY p.name
LIMIT 10;