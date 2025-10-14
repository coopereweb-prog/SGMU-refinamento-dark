-- 1. Criar a tabela de tarefas de instalação
CREATE TABLE public.installation_tasks (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    order_item_id uuid NOT NULL REFERENCES public.order_items(id) ON DELETE CASCADE,
    point_id uuid NOT NULL REFERENCES public.points(id) ON DELETE CASCADE,
    status text DEFAULT 'pending_art'::text NOT NULL,
    assigned_technician_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Adicionar um gatilho para atualizar 'updated_at'
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.installation_tasks
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.installation_tasks ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas de segurança
CREATE POLICY "Admins e Gerentes podem gerenciar todas as tarefas"
ON public.installation_tasks FOR ALL
USING (get_current_user_role() IN ('admin', 'operations_manager'));

CREATE POLICY "Técnicos podem ver suas próprias tarefas atribuídas"
ON public.installation_tasks FOR SELECT
USING (get_current_user_role() = 'field_technician' AND assigned_technician_id = auth.uid());

CREATE POLICY "Técnicos podem atualizar suas próprias tarefas"
ON public.installation_tasks FOR UPDATE
USING (get_current_user_role() = 'field_technician' AND assigned_technician_id = auth.uid());

-- 4. Criar função e gatilho para popular a tabela automaticamente
CREATE OR REPLACE FUNCTION public.create_installation_task_on_send()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    -- Verifica se a coluna installation_sent foi alterada para TRUE
    IF NEW.installation_sent = true AND OLD.installation_sent IS DISTINCT FROM true THEN
        -- Insere uma tarefa para cada item do pedido
        INSERT INTO public.installation_tasks (order_item_id, point_id)
        SELECT id, point_id
        FROM public.order_items
        WHERE order_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_sent_to_installation
AFTER UPDATE OF installation_sent ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.create_installation_task_on_send();

-- 5. Criar função e gatilho para verificar a conclusão do pedido
CREATE OR REPLACE FUNCTION public.check_order_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_order_id uuid;
    total_tasks integer;
    completed_tasks integer;
    v_customer_email text;
BEGIN
    -- Apenas executa se o status da tarefa for alterado para 'completed'
    IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
        -- Encontra o ID do pedido associado a esta tarefa
        SELECT order_id INTO v_order_id
        FROM public.order_items
        WHERE id = NEW.order_item_id;

        -- Conta o total de tarefas para este pedido
        SELECT count(*) INTO total_tasks
        FROM public.installation_tasks it
        JOIN public.order_items oi ON it.order_item_id = oi.id
        WHERE oi.order_id = v_order_id;

        -- Conta as tarefas concluídas para este pedido
        SELECT count(*) INTO completed_tasks
        FROM public.installation_tasks it
        JOIN public.order_items oi ON it.order_item_id = oi.id
        WHERE oi.order_id = v_order_id AND it.status = 'completed';

        -- Se todas as tarefas estiverem concluídas, invoca a Edge Function
        IF total_tasks = completed_tasks THEN
            -- Busca o e-mail do cliente
            SELECT customer_email INTO v_customer_email
            FROM public.orders
            WHERE id = v_order_id;

            -- Invoca a função para enviar o e-mail
            PERFORM net.http_post(
                url := supabase_url() || '/functions/v1/send-completion-email',
                headers := '{"Content-Type": "application/json", "Authorization": "Bearer " || service_role_key()}',
                body := json_build_object(
                    'order_id', v_order_id,
                    'customer_email', v_customer_email
                )::text
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_task_completed_check_order
AFTER UPDATE OF status ON public.installation_tasks
FOR EACH ROW
EXECUTE FUNCTION public.check_order_completion();