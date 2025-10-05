SELECT 
    id, 
    name, 
    status, 
    latitude, 
    longitude
FROM public.points 
WHERE latitude IS NULL 
    OR longitude IS NULL 
    OR latitude = 0 
    OR longitude = 0
ORDER BY name;