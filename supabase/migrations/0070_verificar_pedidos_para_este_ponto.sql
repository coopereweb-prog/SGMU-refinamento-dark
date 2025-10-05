SELECT 
    o.id,
    o.customer_name,
    o.customer_email,
    o.status,
    o.total_amount,
    o.created_at,
    o.reserved_until,
    oi.id as item_id,
    oi.period_years,
    oi.price
FROM public.orders o
INNER JOIN public.order_items oi ON o.id = oi.order_id
INNER JOIN public.points p ON oi.point_id = p.id
WHERE p.name = 'Bronze - Rua Treze de Maio, 712'
ORDER BY o.created_at DESC;