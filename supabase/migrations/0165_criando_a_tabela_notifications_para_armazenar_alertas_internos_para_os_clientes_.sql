-- Tabela de Notificações
CREATE TABLE public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- O usuário que deve receber a notificação
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- Link opcional para a página do pedido/ponto
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Obrigatório)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS:
-- 1. Usuários só podem ver suas próprias notificações
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- 2. Usuários não podem criar/deletar/atualizar (apenas o sistema/admin pode)
-- Apenas o sistema (via RLS bypass ou função) pode inserir/atualizar/deletar.
-- Vamos permitir que o usuário atualize 'is_read'
CREATE POLICY "Users can mark their own notifications as read" ON public.notifications
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. Permitir que o sistema (via função) insira notificações
-- Não precisamos de uma política INSERT se usarmos uma função SECURITY DEFINER.