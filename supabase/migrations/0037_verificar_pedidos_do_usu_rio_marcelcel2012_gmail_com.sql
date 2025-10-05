SELECT 
    o.id,
    o.customer_name,
    o.customer_email,
    o.status,
    o.total_amount,
    o.created_at,
    o.updated_at,
    COUNT(oi.id) as item_count
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
WHERE o.customer_email = 'marcelcel2012@gmail.com'
GROUP BY o.id, o.customer_name, o.customer_email, o.status, o.total_amount, o.created_at, o.updated_at
ORDER BY o.created_at DESC;