-- Adiciona uma coluna para rastrear o envio da notificação de 24 horas
ALTER TABLE public.orders
ADD COLUMN is_24h_notification_sent BOOLEAN DEFAULT FALSE;