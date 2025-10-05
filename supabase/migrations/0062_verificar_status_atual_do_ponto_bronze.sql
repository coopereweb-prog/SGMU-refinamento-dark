SELECT 
    p.id,
    p.name,
    p.status,
    p.is_available,
    p.reserved_until,
    p.reserved_by,
    p.price_1y
FROM public.points p
LEFT JOIN public.pricing_tiers pt ON p.pricing_tier_id = pt.id
WHERE pt.name = 'Bronze'
    AND p.is_available = true;