UPDATE public.points 
SET 
    status = 'available',
    is_available = true,
    reserved_until = NULL,
    reserved_by = NULL
WHERE name = 'Bronze - Rua Treze de Maio, 712' 
    AND reserved_until < NOW();