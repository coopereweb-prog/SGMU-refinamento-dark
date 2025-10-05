-- Habilitar RLS na tabela pricing_tiers
ALTER TABLE public.pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Criar políticas para pricing_tiers
CREATE POLICY "Admins podem gerenciar pricing_tiers" ON public.pricing_tiers
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Criar política para leitura pública de pricing_tiers
CREATE POLICY "Leitura pública de pricing_tiers" ON public.pricing_tiers
  FOR SELECT TO authenticated
  USING (true);