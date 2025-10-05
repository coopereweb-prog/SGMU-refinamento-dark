SELECT 
    p.id,
    p.name,
    p.status,
    p.is_available,
    p.price_1y,
    p.price_2y,
    p.price_3y,
    p.price_4y,
    p.price_5y,
    p.reserved_until,
    p.reserved_by,
    pt.name as tier_name
FROM public.points p
LEFT JOIN public.pricing_tiers pt ON p.pricing_tier_id = pt.id
WHERE pt.name = 'Bronze'
    AND p.is_available = true;