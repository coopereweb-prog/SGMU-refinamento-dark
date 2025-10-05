SELECT 
    o.id,
    o.customer_name,
    o.customer_email,
    o.status,
    o.total_amount,
    o.created_at,
    COUNT(oi.id) as item_count
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
WHERE o.created_at >= NOW() - INTERVAL '24 hours'
GROUP BY o.id, o.customer_name, o.customer_email, o.status, o.total_amount, o.created_at
ORDER BY o.created_at DESC;