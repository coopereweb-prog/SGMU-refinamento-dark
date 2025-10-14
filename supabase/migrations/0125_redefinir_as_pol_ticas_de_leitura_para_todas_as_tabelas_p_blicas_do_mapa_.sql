-- Limpando políticas antigas para a tabela de pontos
DROP POLICY IF EXISTS "Pontos podem ser lidos por qualquer pessoa" ON public.points;
DROP POLICY IF EXISTS "Allow public read access to points" ON public.points;

-- Limpando políticas antigas para a tabela de tags
DROP POLICY IF EXISTS "Permitir leitura pública das tags" ON public.tags;
DROP POLICY IF EXISTS "Authenticated users can view tags" ON public.tags;

-- Limpando políticas antigas para a tabela de junção point_tags
DROP POLICY IF EXISTS "Allow public point_tags reading" ON public.point_tags;
DROP POLICY IF EXISTS "Authenticated users can view point_tags" ON public.point_tags;

-- Limpando políticas antigas para a tabela de níveis de preço
DROP POLICY IF EXISTS "Leitura pública de pricing_tiers" ON public.pricing_tiers;

-- Criando as novas e corretas políticas de leitura pública
CREATE POLICY "Permitir leitura pública de pontos" ON public.points FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de point_tags" ON public.point_tags FOR SELECT USING (true);
CREATE POLICY "Permitir leitura pública de pricing_tiers" ON public.pricing_tiers FOR SELECT USING (true);