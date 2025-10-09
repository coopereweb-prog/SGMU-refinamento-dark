UPDATE public.points
SET description = CONCAT(
  'Ponto Ouro - ',
  SPLIT_PART(name, ' - ', 2),
  '. Localização premium com alta visibilidade. Preços: 1 ano R$ 1.000,00, 2 anos R$ 1.800,00, 3 anos R$ 2.600,00, 4 anos R$ 3.200,00, 5 anos R$ 3.800,00'
)
WHERE pricing_tier_id = (SELECT id FROM public.pricing_tiers WHERE name = 'Ouro');