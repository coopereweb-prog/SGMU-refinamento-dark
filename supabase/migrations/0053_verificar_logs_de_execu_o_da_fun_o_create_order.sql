-- Verificar se há algum pedido com erro
SELECT 
    id,
    customer_name,
    customer_email,
    status,
    total_amount,
    created_at,
    updated_at
FROM public.orders
WHERE created_at >= NOW() - INTERVAL '2 hours'
ORDER BY created_at DESC;