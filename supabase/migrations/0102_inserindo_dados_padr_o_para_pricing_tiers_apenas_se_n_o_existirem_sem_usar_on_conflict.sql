INSERT INTO public.pricing_tiers (name, price_1y, price_2y, price_3y, price_4y, price_5y, description_template)
SELECT 'Bronze', 500, 900, 1300, 1600, 1900, 'Ponto Bronze - {{point_name}}. Boa localização com visibilidade básica. Preços: 1 ano R$ {{price_1y}}, 2 anos R$ {{price_2y}}, 3 anos R$ {{price_3y}}, 4 anos R$ {{price_4y}}, 5 anos R$ {{price_5y}}'
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_tiers WHERE name = 'Bronze')
UNION ALL
SELECT 'Prata', 750, 1350, 1950, 2400, 2850, 'Ponto Prata - {{point_name}}. Excelente localização com boa visibilidade. Preços: 1 ano R$ {{price_1y}}, 2 anos R$ {{price_2y}}, 3 anos R$ {{price_3y}}, 4 anos R$ {{price_4y}}, 5 anos R$ {{price_5y}}'
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_tiers WHERE name = 'Prata')
UNION ALL
SELECT 'Ouro', 1000, 1800, 2600, 3200, 3800, 'Ponto Ouro - {{point_name}}. Localização premium com alta visibilidade. Preços: 1 ano R$ {{price_1y}}, 2 anos R$ {{price_2y}}, 3 anos R$ {{price_3y}}, 4 anos R$ {{price_4y}}, 5 anos R$ {{price_5y}}'
WHERE NOT EXISTS (SELECT 1 FROM public.pricing_tiers WHERE name = 'Ouro');