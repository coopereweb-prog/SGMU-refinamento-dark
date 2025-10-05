SELECT 
    p.id,
    p.name,
    p.status,
    p.is_available,
    p.latitude,
    p.longitude,
    p.price_1y,
    pt.name as tier_name,
    COUNT(ptg.tag_id) as tag_count
FROM public.points p
LEFT JOIN public.pricing_tiers pt ON p.pricing_tier_id = pt.id
LEFT JOIN public.point_tags ptg ON p.id = ptg.point_id
WHERE p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL 
    AND p.latitude != 0 
    AND p.longitude != 0
GROUP BY p.id, p.name, p.status, p.is_available, p.latitude, p.longitude, p.price_1y, pt.name
ORDER BY p.name;