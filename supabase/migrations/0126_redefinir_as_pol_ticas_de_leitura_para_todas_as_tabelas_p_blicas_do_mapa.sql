-- Remove políticas de leitura conflitantes ou antigas para garantir um estado limpo
DROP POLICY IF EXISTS "Permitir leitura pública de pontos" ON public.points;
DROP POLICY IF EXISTS "Permitir leitura pública de tags" ON public.tags;
DROP POLICY IF EXISTS "Permitir leitura pública de point_tags" ON public.point_tags;
DROP POLICY IF EXISTS "Permitir leitura pública de pricing_tiers" ON public.pricing_tiers;

-- Cria políticas de leitura pública definitivas para garantir que os dados do mapa sejam visíveis
CREATE POLICY "Permitir leitura pública de pontos" ON public.points FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de point_tags" ON public.point_tags FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de pricing_tiers" ON public.pricing_tiers FOR SELECT USING (true);