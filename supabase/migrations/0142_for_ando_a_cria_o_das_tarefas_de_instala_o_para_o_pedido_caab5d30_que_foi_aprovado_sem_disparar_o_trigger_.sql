-- 1. Define installation_sent como FALSE para garantir que o próximo UPDATE dispare o trigger
UPDATE public.orders
SET installation_sent = FALSE
WHERE id = 'caab5d30-0000-0000-0000-000000000000';

-- 2. Atualiza a coluna installation_sent para TRUE para disparar o trigger e criar as tarefas
UPDATE public.orders
SET installation_sent = TRUE
WHERE id = 'caab5d30-0000-0000-0000-000000000000' AND status = 'completed';