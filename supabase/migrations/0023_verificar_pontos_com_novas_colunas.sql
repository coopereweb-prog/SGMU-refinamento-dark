SELECT 
    id, 
    name, 
    status, 
    is_available,
    image_url,
    pricing_tier_id,
    latitude,
    longitude
FROM public.points 
ORDER BY name
LIMIT 5;