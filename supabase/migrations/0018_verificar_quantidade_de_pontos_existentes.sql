-- Verificação segura: não falha se tabela não existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'points'
  ) THEN
    RAISE NOTICE 'Total de pontos: %', (SELECT COUNT(*) FROM public.points);
  ELSE
    RAISE NOTICE 'Tabela points não existe. Contagem ignorada.';
  END IF;
END $$;