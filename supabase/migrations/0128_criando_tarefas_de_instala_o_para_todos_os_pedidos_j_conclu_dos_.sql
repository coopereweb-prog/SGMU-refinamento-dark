-- Primeiro, garante que todos os pedidos concluídos estejam marcados como enviados para instalação, para consistência.
UPDATE public.orders
SET installation_sent = true
WHERE status = 'completed' AND (installation_sent IS NULL OR installation_sent = false);

-- Em seguida, insere as tarefas para os itens de pedidos concluídos que ainda não têm uma tarefa.
INSERT INTO public.installation_tasks (order_item_id, point_id)
SELECT oi.id, oi.point_id
FROM public.order_items oi
JOIN public.orders o ON oi.order_id = o.id
WHERE o.status = 'completed'
-- Garante que não criemos tarefas duplicadas se o script for executado novamente
AND NOT EXISTS (
    SELECT 1
    FROM public.installation_tasks it
    WHERE it.order_item_id = oi.id
);