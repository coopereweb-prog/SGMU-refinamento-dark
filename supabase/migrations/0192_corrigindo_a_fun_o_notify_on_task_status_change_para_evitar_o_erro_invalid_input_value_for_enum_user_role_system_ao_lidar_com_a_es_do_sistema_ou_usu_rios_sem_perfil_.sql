CREATE OR REPLACE FUNCTION public.notify_on_task_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_order_id uuid;
    v_client_user_id uuid;
    v_point_name text;
    v_status_label text;
    v_message text;
    v_link text := '/dashboard';
    v_current_user_id uuid := auth.uid();
    v_current_user_name text;
    v_current_user_role user_role;
    v_admin_ids uuid[];
    v_action_source text;
BEGIN
    -- Apenas executa se o status da tarefa for alterado
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        -- 1. Encontra o ID do pedido, do ponto e o nome do ponto
        SELECT oi.order_id, p.name INTO v_order_id, v_point_name
        FROM public.order_items oi
        JOIN public.points p ON oi.point_id = p.id
        WHERE oi.id = NEW.order_item_id;

        -- 2. Busca o user_id do cliente
        SELECT user_id INTO v_client_user_id
        FROM public.orders
        WHERE id = v_order_id;

        -- 3. Determina a fonte da ação
        IF v_current_user_id IS NULL THEN
            -- Ação disparada por trigger ou RPC sem autenticação (Sistema)
            v_action_source := 'O sistema';
            v_current_user_role := 'system_action'::user_role; -- Usamos um valor que não será usado na comparação de role, mas é seguro
        ELSE
            -- Busca o nome e a função do usuário que disparou a ação
            SELECT name, role INTO v_current_user_name, v_current_user_role
            FROM public.profiles
            WHERE id = v_current_user_id;

            -- Se o perfil não for encontrado, trata como sistema
            IF v_current_user_name IS NULL THEN
                v_action_source := 'O sistema (Usuário ' || substring(v_current_user_id::text from 1 for 8) || ')';
                v_current_user_role := 'system_action'::user_role;
            ELSIF v_current_user_role = 'field_technician'::user_role THEN
                v_action_source := 'O técnico ' || v_current_user_name;
            ELSIF v_current_user_role IN ('admin', 'operations_manager') THEN
                v_action_source := 'O operador ' || v_current_user_name;
            ELSE
                v_action_source := 'O usuário ' || v_current_user_name;
            END IF;
        END IF;

        -- 4. Define o rótulo e a mensagem com base no status
        CASE NEW.status
            WHEN 'pending_art' THEN 
                v_status_label := 'Aguardando Aprovação da Arte';
                v_message := v_action_source || ' moveu o ponto "' || v_point_name || '" (Pedido #' || substring(v_order_id::text from 1 for 8) || ') para: ' || v_status_label || '.';
            WHEN 'art_approved' THEN 
                v_status_label := 'Em Impressão';
                v_message := v_action_source || ' aprovou a arte do ponto "' || v_point_name || '", que agora está em impressão.';
            WHEN 'pending_assignment' THEN 
                v_status_label := 'Pronto para Atribuição';
                v_message := v_action_source || ' moveu o ponto "' || v_point_name || '" para: ' || v_status_label || '.';
            WHEN 'assigned' THEN 
                v_status_label := 'Em Campo (Instalação)';
                v_message := v_action_source || ' atribuiu a instalação do ponto "' || v_point_name || '" à equipe de campo.';
            WHEN 'on_hold' THEN 
                v_status_label := 'Em Espera (Problema)';
                v_message := v_action_source || ' colocou a instalação do ponto "' || v_point_name || '" em espera devido a um problema.';
            WHEN 'completed' THEN
                v_status_label := 'Instalação Finalizada';
                v_message := v_action_source || ' concluiu a instalação do ponto "' || v_point_name || '" (Pedido #' || substring(v_order_id::text from 1 for 8) || ').';
                v_link := '/dashboard?feature=visitation_route';
            ELSE 
                v_status_label := NEW.status;
                v_message := v_action_source || ' atualizou o status do ponto "' || v_point_name || '" para: ' || v_status_label || '.';
        END CASE;

        -- 5. Insere a notificação para o CLIENTE (se houver um cliente associado)
        IF v_client_user_id IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, title, message, link)
            VALUES (
                v_client_user_id,
                v_status_label,
                v_message,
                v_link
            );
        END IF;

        -- 6. Insere a notificação para ADMINS/OPS_MANAGERS (sempre que houver uma ação de pipeline)
        -- Busca IDs de todos os administradores e gerentes de operações
        SELECT array_agg(id) INTO v_admin_ids
        FROM public.profiles
        WHERE role IN ('admin', 'operations_manager');

        -- Cria uma mensagem específica para o admin/gerente, focando em quem agiu
        v_message := v_action_source || ' atualizou o status do ponto "' || v_point_name || '" (Pedido #' || substring(v_order_id::text from 1 for 8) || ') para: ' || v_status_label || '.';
        v_link := '/admin/pipeline';

        FOREACH v_admin_ids IN ARRAY v_admin_ids
        LOOP
            INSERT INTO public.notifications (user_id, title, message, link)
            VALUES (
                v_admin_ids,
                'Ação no Pipeline: ' || v_status_label,
                v_message,
                v_link
            );
        END LOOP;
    END IF;
    RETURN NEW;
END;
$function$;