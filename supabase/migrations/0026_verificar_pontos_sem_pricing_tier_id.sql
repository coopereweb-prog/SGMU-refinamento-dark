SELECT 
    id, 
    name, 
    status, 
    pricing_tier_id
FROM public.points 
WHERE pricing_tier_id IS NULL
ORDER BY name;