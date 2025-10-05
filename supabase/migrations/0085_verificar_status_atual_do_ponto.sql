SELECT 
    p.id,
    p.name,
    p.status,
    p.is_available,
    p.reserved_until,
    p.reserved_by,
    CASE 
        WHEN p.reserved_until IS NOT NULL AND p.reserved_until > NOW() THEN 'RESERVADO_VALIDO'
        WHEN p.reserved_until IS NOT NULL AND p.reserved_until <= NOW() THEN 'RESERVADO_EXPIRADO'
        ELSE p.status::text
    END as status_real
FROM public.points p
WHERE p.name = 'Bronze - Rua Treze de Maio, 712';