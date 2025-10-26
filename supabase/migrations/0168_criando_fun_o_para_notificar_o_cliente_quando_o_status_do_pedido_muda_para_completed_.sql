CREATE OR REPLACE FUNCTION public.notify_on_order_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
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

    RETURN NEW;
END;
$function$;