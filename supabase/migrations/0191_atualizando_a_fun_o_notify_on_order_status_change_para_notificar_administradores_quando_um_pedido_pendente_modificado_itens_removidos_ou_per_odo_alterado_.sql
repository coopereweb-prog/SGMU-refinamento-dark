CREATE OR REPLACE FUNCTION public.notify_on_order_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_admin_ids uuid[];
    v_message text;
    v_link text := '/admin/orders/' || NEW.id;
    v_current_user_name text;
    v_current_user_role user_role;
    v_action_source text;
BEGIN
    -- Busca IDs de todos os administradores e gerentes de operações
    SELECT array_agg(id) INTO v_admin_ids
    FROM public.profiles
    WHERE role IN ('admin', 'operations_manager');

    -- Busca o nome e a função do usuário que disparou a ação
    SELECT name, role INTO v_current_user_name, v_current_user_role
    FROM public.profiles
    WHERE id = auth.uid();

    v_current_user_name := COALESCE(v_current_user_name, 'Sistema');
    v_action_source := v_current_user_name;

    -- Notificação de Pedido Aprovado (Completed)
    IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
        IF NEW.user_id IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, title, message, link)
            VALUES (
                NEW.user_id,
                'Pedido Aprovado!',
                'Seu pedido #' || substring(NEW.id::text from 1 for 8) || ' foi aprovado e está sendo processado para instalação.',
                '/dashboard'
            );
        END IF;
    END IF;
    
    -- Notificação de Pedido Cancelado
    IF NEW.status = 'cancelled' AND OLD.status IS DISTINCT FROM 'cancelled' THEN
        IF NEW.user_id IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, title, message, link)
            VALUES (
                NEW.user_id,
                'Pedido Cancelado',
                'Seu pedido #' || substring(NEW.id::text from 1 for 8) || ' foi cancelado. Os pontos foram liberados.',
                '/dashboard'
            );
        END IF;
        
        -- Notifica admins sobre cancelamento
        v_message := 'O pedido #' || substring(NEW.id::text from 1 for 8) || ' foi cancelado por ' || v_action_source || '.';
        FOREACH v_admin_ids IN ARRAY v_admin_ids
        LOOP
            INSERT INTO public.notifications (user_id, title, message, link)
            VALUES (v_admin_ids, 'Pedido Cancelado', v_message, v_link);
        END LOOP;
    END IF;

    -- Notificação de Reserva Prorrogada (se houver uma data de expiração nova e o status for 'pending')
    IF NEW.status = 'pending' AND NEW.reserved_until IS DISTINCT FROM OLD.reserved_until AND NEW.reserved_until IS NOT NULL THEN
        IF NEW.user_id IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, title, message, link)
            VALUES (
                NEW.user_id,
                'Reserva Prorrogada',
                'A reserva do seu pedido #' || substring(NEW.id::text from 1 for 8) || ' foi prorrogada até ' || to_char(NEW.reserved_until, 'DD/MM/YYYY HH24:MI') || '.',
                '/dashboard'
            );
        END IF;
    END IF;
    
    -- Notificação de Modificação de Pedido (Itens removidos ou preço alterado)
    IF NEW.status = 'pending' AND NEW.total_amount IS DISTINCT FROM OLD.total_amount THEN
        v_message := 'O pedido #' || substring(NEW.id::text from 1 for 8) || ' foi modificado por ' || v_action_source || '. Novo valor total: R$ ' || NEW.total_amount::text || '.';
        
        FOREACH v_admin_ids IN ARRAY v_admin_ids
        LOOP
            INSERT INTO public.notifications (user_id, title, message, link)
            VALUES (v_admin_ids, 'Pedido Modificado', v_message, v_link);
        END LOOP;
    END IF;

    RETURN NEW;
END;
$function$;