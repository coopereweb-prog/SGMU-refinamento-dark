CREATE OR REPLACE FUNCTION public.confirm_order_and_update_points(p_order_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Atualiza o status do pedido para 'completed', limpa a data de expiração
    -- E marca 'installation_sent' como TRUE para disparar o trigger de criação de tarefas
    UPDATE public.orders
    SET status = 'completed', reserved_until = NULL, updated_at = now(), installation_sent = TRUE
    WHERE id = p_order_id;

    -- Atualiza o status dos pontos associados para 'sold'
    UPDATE public.points
    SET status = 'sold'
    WHERE id IN (SELECT point_id FROM public.order_items WHERE order_id = p_order_id);
END;
$function$