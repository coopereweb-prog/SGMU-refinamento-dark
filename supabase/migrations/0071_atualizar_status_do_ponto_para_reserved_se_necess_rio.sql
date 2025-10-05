UPDATE public.points 
SET 
    status = 'reserved',
    is_available = false
WHERE name = 'Bronze - Rua Treze de Maio, 712' 
    AND status = 'available';