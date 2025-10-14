-- Adiciona as novas colunas à tabela de tarefas
ALTER TABLE public.installation_tasks
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS art_file_url TEXT,
ADD COLUMN IF NOT EXISTS due_date DATE;

-- Atualiza as políticas de segurança para permitir que técnicos e gerentes modifiquem as novas colunas
DROP POLICY IF EXISTS "Técnicos podem atualizar suas próprias tarefas" ON public.installation_tasks;
CREATE POLICY "Técnicos podem atualizar suas próprias tarefas"
ON public.installation_tasks FOR UPDATE
TO authenticated
USING ((get_current_user_role() = 'field_technician'::text) AND (assigned_technician_id = auth.uid()))
WITH CHECK ((get_current_user_role() = 'field_technician'::text) AND (assigned_technician_id = auth.uid()));

DROP POLICY IF EXISTS "Admins e Gerentes podem gerenciar todas as tarefas" ON public.installation_tasks;
CREATE POLICY "Admins e Gerentes podem gerenciar todas as tarefas"
ON public.installation_tasks FOR ALL
TO authenticated
USING (get_current_user_role() = ANY (ARRAY['admin'::text, 'operations_manager'::text]))
WITH CHECK (get_current_user_role() = ANY (ARRAY['admin'::text, 'operations_manager'::text]));