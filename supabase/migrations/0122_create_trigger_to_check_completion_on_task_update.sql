-- Remove o gatilho existente, se houver, para garantir que a versão mais recente seja criada.
DROP TRIGGER IF EXISTS on_task_completed_trigger ON public.installation_tasks;

-- Cria o gatilho que será acionado após uma atualização na tabela de tarefas de instalação.
CREATE TRIGGER on_task_completed_trigger
-- Aciona DEPOIS que a atualização na linha for concluída.
AFTER UPDATE ON public.installation_tasks
-- Executa a lógica para cada linha que foi modificada.
FOR EACH ROW
-- CONDIÇÃO: O gatilho só será disparado se o status antigo era diferente de 'completed'
-- E o novo status é 'completed'. Isso evita execuções desnecessárias.
WHEN (OLD.status IS DISTINCT FROM 'completed' AND NEW.status = 'completed')
-- AÇÃO: Executa a função que criamos para verificar se o pedido inteiro foi concluído.
EXECUTE FUNCTION public.check_order_completion_and_notify();