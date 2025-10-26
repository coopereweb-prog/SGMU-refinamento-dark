-- Insere uma tarefa para cada item do pedido #caab5d30
INSERT INTO public.installation_tasks (order_item_id, point_id)
SELECT id, point_id
FROM public.order_items
WHERE order_id = 'caab5d30-0000-0000-0000-000000000000'
ON CONFLICT DO NOTHING; -- Garante que não haverá duplicatas se as tarefas já existirem