CREATE OR REPLACE FUNCTION public.check_order_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_order_id uuid;
    total_tasks integer;
    completed_tasks integer;
    v_customer_name text;
    v_user_id uuid;
BEGIN
    -- Apenas executa se o status da tarefa for alterado para 'completed'
    IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
        -- 1. Encontra o ID do pedido associado a esta tarefa
        SELECT order_id INTO v_order_id
        FROM public.order_items
        WHERE id = NEW.order_item_id;

        -- 2. Conta o total de tarefas e as tarefas concluídas para este pedido
        SELECT count(*) INTO total_tasks
        FROM public.installation_tasks it
        JOIN public.order_items oi ON it.order_item_id = oi.id
        WHERE oi.order_id = v_order_id;

        SELECT count(*) INTO completed_tasks
        FROM public.installation_tasks it
        JOIN public.order_items oi ON it.order_item_id = oi.id
        WHERE oi.order_id = v_order_id AND it.status = 'completed';

        -- 3. Se todas as tarefas estiverem concluídas, cria a notificação
        IF total_tasks = completed_tasks THEN
            -- Busca o nome e o user_id do cliente
            SELECT customer_name, user_id INTO v_customer_name, v_user_id
            FROM public.orders
            WHERE id = v_order_id;

            -- Insere a notificação na nova tabela
            IF v_user_id IS NOT NULL THEN
                INSERT INTO public.notifications (user_id, title, message, link)
                VALUES (
                    v_user_id,
                    'Instalação Concluída!',
                    'Todas as placas do seu pedido #' || substring(v_order_id::text from 1 for 8) || ' foram instaladas com sucesso. Você pode ver as fotos e gerar rotas de visita.',
                    '/dashboard?feature=visitation_route'
                );
            END IF;
            
            -- Opcional: Notificar o admin/gerente de operações (se necessário, mas vamos focar no cliente por enquanto)
            -- ...
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;