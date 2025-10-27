CREATE OR REPLACE FUNCTION public.notify_on_task_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_order_id uuid;
    v_user_id uuid;
    v_point_name text;
    v_status_label text;
    v_message text;
    v_link text := '/dashboard';
BEGIN
    -- Apenas executa se o status da tarefa for alterado
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        -- 1. Encontra o ID do pedido e do ponto
        SELECT oi.order_id, p.name INTO v_order_id, v_point_name
        FROM public.order_items oi
        JOIN public.points p ON oi.point_id = p.id
        WHERE oi.id = NEW.order_item_id;

        -- 2. Busca o user_id do cliente
        SELECT user_id INTO v_user_id
        FROM public.orders
        WHERE id = v_order_id;

        -- 3. Define o rótulo e a mensagem com base no status
        CASE NEW.status
            WHEN 'pending_art' THEN 
                v_status_label := 'Aguardando Aprovação da Arte';
                v_message := 'O ponto "' || v_point_name || '" do seu pedido #' || substring(v_order_id::text from 1 for 8) || ' está agora em: ' || v_status_label;
            WHEN 'art_approved' THEN 
                v_status_label := 'Em Impressão';
                v_message := 'A arte do ponto "' || v_point_name || '" foi aprovada e está em impressão.';
            WHEN 'pending_assignment' THEN 
                v_status_label := 'Pronto para Atribuição';
                v_message := 'O ponto "' || v_point_name || '" está pronto para ser atribuído à equipe de instalação.';
            WHEN 'assigned' THEN 
                v_status_label := 'Em Campo (Instalação)';
                v_message := 'A instalação do ponto "' || v_point_name || '" foi atribuída e está a caminho.';
            WHEN 'on_hold' THEN 
                v_status_label := 'Em Espera (Problema)';
                v_message := 'A instalação do ponto "' || v_point_name || '" foi colocada em espera devido a um problema. Entraremos em contato.';
            WHEN 'completed' THEN
                v_status_label := 'Instalação Finalizada';
                v_message := 'O ponto "' || v_point_name || '" do seu pedido #' || substring(v_order_id::text from 1 for 8) || ' foi instalado com sucesso.';
                v_link := '/dashboard?feature=visitation_route';
            ELSE 
                v_status_label := NEW.status;
                v_message := 'O status do ponto "' || v_point_name || '" foi atualizado para: ' || v_status_label;
        END CASE;

        -- 4. Insere a notificação
        IF v_user_id IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, title, message, link)
            VALUES (
                v_user_id,
                v_status_label,
                v_message,
                v_link
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;