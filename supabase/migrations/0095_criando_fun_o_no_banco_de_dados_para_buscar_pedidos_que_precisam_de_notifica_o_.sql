-- Cria uma função para buscar pedidos pendentes com mais de 24h que ainda não foram notificados
CREATE OR REPLACE FUNCTION get_orders_for_24h_notification()
RETURNS TABLE (
  id uuid,
  customer_name text,
  customer_email text,
  created_at timestamptz,
  total_amount numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    o.id,
    o.customer_name,
    o.customer_email,
    o.created_at,
    o.total_amount
  FROM
    public.orders AS o
  WHERE
    o.status = 'pending'
    AND o.reserved_until > now() -- Garante que ainda não expirou
    AND o.created_at <= now() - interval '24 hours' -- Tem mais de 24h
    AND o.is_24h_notification_sent = FALSE; -- Notificação ainda não foi enviada
END;
$$;