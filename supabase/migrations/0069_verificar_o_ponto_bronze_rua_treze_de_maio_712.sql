SELECT 
    p.id,
    p.name,
    p.status,
    p.is_available,
    p.reserved_until,
    p.reserved_by,
    p.price_1y,
    p.price_2y,
    p.price_3y,
    p.price_4y,
    p.price_5y
FROM public.points p
WHERE p.name = 'Bronze - Rua Treze de Maio, 712';