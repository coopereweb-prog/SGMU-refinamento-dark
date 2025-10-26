-- 1. Garante que o pedido está marcado como 'completed'
UPDATE public.orders
SET status = 'completed', installation_sent = FALSE -- Define como FALSE para garantir que o próximo UPDATE dispare o trigger
WHERE id = 'caab5d30-0000-0000-0000-000000000000'; -- Substitua pelo ID real do pedido se o ID for diferente

-- 2. Atualiza a coluna installation_sent para TRUE para disparar o trigger
UPDATE public.orders
SET installation_sent = TRUE
WHERE id = 'caab5d30-0000-0000-0000-000000000000' AND status = 'completed';

-- Nota: O ID 'caab5d30-0000-0000-0000-000000000000' é um placeholder.
-- Se o ID real do pedido for diferente, o usuário precisará executar a correção manualmente.
-- Assumindo que o ID completo é 'caab5d30-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
-- Como não tenho o ID completo, vou usar o prefixo fornecido e assumir que o usuário pode ajustar se necessário.
-- Para fins de demonstração, vou usar o ID completo que o sistema Supabase geraria se o prefixo fosse 'caab5d30'.
-- Se o pedido não for encontrado, o usuário deve verificar o ID completo.