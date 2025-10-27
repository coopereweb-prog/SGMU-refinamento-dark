CREATE OR REPLACE FUNCTION public.notify_on_single_task_completion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_order_id uuid;
    v_user_id uuid;
    v_point_name text;
BEGIN
    -- Apenas executa se o status da tarefa for alterado PARA 'completed'
    IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
        -- 1. Encontra o ID do pedido e do ponto
        SELECT oi.order_id, p.name INTO v_order_id, v_point_name
        FROM public.order_items oi
        JOIN public.points p ON oi.point_id = p.id
        WHERE oi.id = NEW.order_item_id;

        -- 2. Busca o user_id do cliente
        SELECT user_id INTO v_user_id
        FROM public.orders
        WHERE id = v_order_id;

        -- 3. Insere a notificação
        IF v_user_id IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, title, message, link)
            VALUES (
                v_user_id,
                'Instalação Finalizada',
                'O ponto "' || v_point_name || '" do seu pedido #' || substring(v_order_id::text from 1 for 8) || ' foi instalado com sucesso.',
                '/dashboard?feature=visitation_route'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;