SELECT 
    id,
    name,
    status,
    latitude,
    longitude,
    pricing_tier_id,
    is_available
FROM public.points 
WHERE latitude IS NULL 
    OR longitude IS NULL 
    OR pricing_tier_id IS NULL
    OR latitude = 0 
    OR longitude = 0;