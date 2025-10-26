CREATE OR REPLACE FUNCTION public.notify_on_task_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_order_id uuid;
    v_customer_name text;
    v_user_id uuid;
    v_point_name text;
    v_status_label text;
BEGIN
    -- Apenas executa se o status da tarefa for alterado E não for 'completed'
    IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status <> 'completed' THEN
        -- 1. Encontra o ID do pedido e do ponto
        SELECT oi.order_id, p.name INTO v_order_id, v_point_name
        FROM public.order_items oi
        JOIN public.points p ON oi.point_id = p.id
        WHERE oi.id = NEW.order_item_id;

        -- 2. Busca o user_id do cliente
        SELECT user_id INTO v_user_id
        FROM public.orders
        WHERE id = v_order_id;

        -- 3. Define o rótulo do status
        v_status_label := CASE NEW.status
            WHEN 'pending_art' THEN 'Aguardando Aprovação da Arte'
            WHEN 'art_approved' THEN 'Em Impressão'
            WHEN 'pending_assignment' THEN 'Pronto para Atribuição'
            WHEN 'assigned' THEN 'Em Campo (Instalação)'
            WHEN 'on_hold' THEN 'Em Espera (Problema)'
            ELSE NEW.status
        END;

        -- 4. Insere a notificação
        IF v_user_id IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, title, message, link)
            VALUES (
                v_user_id,
                'Atualização de Instalação',
                'O ponto "' || v_point_name || '" do seu pedido #' || substring(v_order_id::text from 1 for 8) || ' está agora em: ' || v_status_label,
                '/dashboard'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;