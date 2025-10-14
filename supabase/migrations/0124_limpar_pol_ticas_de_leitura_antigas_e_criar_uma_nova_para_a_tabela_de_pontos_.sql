-- Removendo políticas de leitura pública existentes para evitar duplicidade
DROP POLICY IF EXISTS "Allow public points reading" ON public.points;
DROP POLICY IF EXISTS "Allow public read access to points" ON public.points;

-- Criando uma nova política clara para permitir que todos vejam os pontos
CREATE POLICY "Pontos podem ser lidos por qualquer pessoa"
ON public.points
FOR SELECT
USING (true);