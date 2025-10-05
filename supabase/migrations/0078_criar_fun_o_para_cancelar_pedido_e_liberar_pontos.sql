CREATE OR REPLACE FUNCTION public.cancel_order_and_release_points(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Atualiza o status do pedido para 'cancelled'
    UPDATE public.orders
    SET status = 'cancelled', reserved_until = NULL, updated_at = now()
    WHERE id = p_order_id;

    -- Libera os pontos, tornando-os 'available' novamente
    UPDATE public.points
    SET status = 'available', is_available = true, reserved_until = NULL, reserved_by = NULL
    WHERE id IN (SELECT point_id FROM public.order_items WHERE order_id = p_order_id);
END;
$$;