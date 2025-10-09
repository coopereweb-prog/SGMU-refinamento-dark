UPDATE public.points
SET description = CONCAT(
  'Ponto Bronze - ',
  SPLIT_PART(name, ' - ', 2),
  '. Boa localização com visibilidade básica. Preços: 1 ano R$ 500,00, 2 anos R$ 900,00, 3 anos R$ 1.300,00, 4 anos R$ 1.600,00, 5 anos R$ 1.900,00'
)
WHERE pricing_tier_id = (SELECT id FROM public.pricing_tiers WHERE name = 'Bronze');