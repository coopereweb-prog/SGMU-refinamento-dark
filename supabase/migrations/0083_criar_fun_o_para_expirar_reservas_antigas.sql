CREATE OR REPLACE FUNCTION public.expire_old_reservations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    expired_order RECORD;
BEGIN
    FOR expired_order IN
        SELECT id FROM public.orders
        WHERE status = 'pending' 
            AND reserved_until IS NOT NULL 
            AND reserved_until < now()
    LOOP
        PERFORM public.cancel_order_and_release_points(expired_order.id);
    END LOOP;
END;
$$;