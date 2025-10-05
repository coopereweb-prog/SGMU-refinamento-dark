SELECT 
    id, 
    name, 
    status, 
    latitude, 
    longitude,
    is_available,
    pricing_tier_id
FROM public.points 
WHERE latitude IS NOT NULL 
    AND longitude IS NOT NULL 
    AND latitude != 0 
    AND longitude != 0
ORDER BY name
LIMIT 10;