-- Habilita a extensão pg_net se ainda não estiver habilitada.
-- É necessário para que o banco de dados possa fazer requisições HTTP para a Edge Function.
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Esta função é acionada quando uma tarefa de instalação é atualizada.
-- Ela verifica se todas as tarefas de um pedido foram concluídas e, em caso afirmativo,
-- chama uma Edge Function para notificar o cliente por e-mail.
CREATE OR REPLACE FUNCTION public.check_order_completion_and_notify()
RETURNS TRIGGER
LANGUAGE plpgsql
-- SECURITY DEFINER é crucial para permitir que a função chame a Edge Function com permissões de serviço.
SECURITY DEFINER
AS $$
DECLARE
  v_order_id UUID;
  v_customer_email TEXT;
  total_tasks INT;
  completed_tasks INT;
  
  -- O Project Ref é obtido do seu ambiente Supabase.
  project_ref TEXT := 'aenwzbmflpfszwxmqypt';
  
  -- IMPORTANTE: A chave anônima (anon key) é necessária para o gateway da API.
  -- Substitua o placeholder abaixo pela sua chave anônima real do Supabase.
  -- Você pode encontrá-la em "Project Settings" > "API".
  anon_key TEXT := '<YOUR_SUPABASE_ANON_KEY>';
  
  function_url TEXT;
BEGIN
  -- 1. A partir do item de pedido da tarefa atualizada, encontre o ID do pedido e o e-mail do cliente.
  SELECT
    oi.order_id,
    o.customer_email
  INTO
    v_order_id,
    v_customer_email
  FROM
    public.order_items oi
  JOIN
    public.orders o ON oi.order_id = o.id
  WHERE
    oi.id = NEW.order_item_id;

  -- Se não encontrar um pedido correspondente, encerra a função.
  IF v_order_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- 2. Conte o número total de tarefas de instalação para este pedido.
  SELECT COUNT(*)
  INTO total_tasks
  FROM public.installation_tasks it
  JOIN public.order_items oi ON it.order_item_id = oi.id
  WHERE oi.order_id = v_order_id;

  -- 3. Conte o número de tarefas concluídas para este pedido.
  SELECT COUNT(*)
  INTO completed_tasks
  FROM public.installation_tasks it
  JOIN public.order_items oi ON it.order_item_id = oi.id
  WHERE oi.order_id = v_order_id AND it.status = 'completed';

  -- 4. Verifique se todas as tarefas estão concluídas.
  IF total_tasks > 0 AND total_tasks = completed_tasks THEN
    -- 5. Se todas estiverem concluídas, invoque a Edge Function para notificar o cliente.
    function_url := 'https://' || project_ref || '.supabase.co/functions/v1/send-completion-email';
    
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', anon_key -- A chave anon é necessária para o gateway; a autorização de serviço é tratada pelo pg_net
      ),
      body := jsonb_build_object(
        'order_id', v_order_id,
        'customer_email', v_customer_email
      )
    );
  END IF;

  RETURN NEW;
END;
$$;