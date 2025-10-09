UPDATE public.points
SET description = CONCAT(
  'Ponto Prata - ',
  SPLIT_PART(name, ' - ', 2),
  '. Excelente localização com boa visibilidade. Preços: 1 ano R$ 750,00, 2 anos R$ 1.350,00, 3 anos R$ 1.950,00, 4 anos R$ 2.400,00, 5 anos R$ 2.850,00'
)
WHERE pricing_tier_id = (SELECT id FROM public.pricing_tiers WHERE name = 'Prata');