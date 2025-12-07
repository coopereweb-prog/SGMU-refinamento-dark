-- Verificação segura: não falha se tabela não existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'points'
  ) THEN
    RAISE NOTICE 'Tabela points existe. Exibindo amostra:';
    PERFORM
      p.id,
      p.name,
      p.status,
      pt.name as tier_name,
      p.price_1y,
      p.price_2y,
      p.price_3y,
      p.price_4y,
      p.price_5y
    FROM public.points p
    LEFT JOIN public.pricing_tiers pt ON p.pricing_tier_id = pt.id
    ORDER BY p.name
    LIMIT 10;
  ELSE
    RAISE NOTICE 'Tabela points não existe. Verificação ignorada.';
  END IF;
END $$;