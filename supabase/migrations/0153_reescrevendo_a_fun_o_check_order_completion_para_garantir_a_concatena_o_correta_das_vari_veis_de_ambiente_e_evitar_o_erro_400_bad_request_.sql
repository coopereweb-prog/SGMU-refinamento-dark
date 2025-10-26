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
    v_customer_email text;
    -- Usando current_setting para obter as variáveis de ambiente
    supabase_url text := current_setting('supabase.url');
    service_role_key text := current_setting('supabase.service_role_key');
    edge_function_url text;
BEGIN
    -- Apenas executa se o status da tarefa for alterado para 'completed'
    IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
        -- Encontra o ID do pedido associado a esta tarefa
        SELECT order_id INTO v_order_id
        FROM public.order_items
        WHERE id = NEW.order_item_id;

        -- Conta o total de tarefas para este pedido
        SELECT count(*) INTO total_tasks
        FROM public.installation_tasks it
        JOIN public.order_items oi ON it.order_item_id = oi.id
        WHERE oi.order_id = v_order_id;

        -- Conta as tarefas concluídas para este pedido
        SELECT count(*) INTO completed_tasks
        FROM public.installation_tasks it
        JOIN public.order_items oi ON it.order_item_id = oi.id
        WHERE oi.order_id = v_order_id AND it.status = 'completed';

        -- Se todas as tarefas estiverem concluídas, invoca a Edge Function
        IF total_tasks = completed_tasks THEN
            -- Busca o e-mail do cliente
            SELECT customer_email INTO v_customer_email
            FROM public.orders
            WHERE id = v_order_id;

            -- Constrói a URL da Edge Function
            edge_function_url := supabase_url || '/functions/v1/send-completion-email';

            -- Invoca a função para enviar o e-mail
            PERFORM net.http_post(
                url := edge_function_url,
                headers := '{"Content-Type": "application/json", "Authorization": "Bearer ' || service_role_key || '"}',
                body := json_build_object(
                    'order_id', v_order_id,
                    'customer_email', v_customer_email
                )::text
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;