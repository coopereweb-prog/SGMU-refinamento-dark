CREATE OR REPLACE FUNCTION public.create_new_order(
    customer_name text,
    customer_email text,
    customer_phone text,
    total_amount numeric,
    items order_item_input[],
    p_user_id uuid DEFAULT NULL -- Parâmetro opcional para o ID do usuário
)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    new_order_id uuid;
    item order_item_input;
    point_ids uuid[];
BEGIN
    SELECT array_agg(i.ponto_id) INTO point_ids FROM unnest(items) AS i;

    IF EXISTS (
        SELECT 1 FROM public.points WHERE id = ANY(point_ids) AND status <> 'available'
    ) THEN
        RAISE EXCEPTION 'Um ou mais pontos selecionados não estão mais disponíveis.';
    END IF;

    -- Adiciona a data de expiração padrão de 48 horas e o user_id se fornecido
    INSERT INTO public.orders (user_id, customer_name, customer_email, customer_phone, total_amount, status, reserved_until)
    VALUES (p_user_id, customer_name, customer_email, customer_phone, total_amount, 'pending', now() + interval '48 hours')
    RETURNING id INTO new_order_id;

    FOREACH item IN ARRAY items
    LOOP
        INSERT INTO public.order_items (order_id, point_id, period_years, price)
        VALUES (new_order_id, item.ponto_id, item.period_years, item.price);
    END LOOP;

    UPDATE public.points SET status = 'reserved' WHERE id = ANY(point_ids);

    RETURN new_order_id;
END;
$function$