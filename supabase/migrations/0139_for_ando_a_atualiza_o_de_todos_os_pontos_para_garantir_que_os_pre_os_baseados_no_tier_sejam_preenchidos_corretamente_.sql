-- Força a atualização de todos os pontos para reativar o trigger de preenchimento de preços.
-- Isso garante que os campos price_1y, price_2y, etc., sejam preenchidos
-- para pontos antigos que podem ter sido criados antes do trigger estar ativo ou configurado corretamente.
UPDATE public.points
SET updated_at = NOW()
WHERE pricing_tier_id IS NOT NULL;