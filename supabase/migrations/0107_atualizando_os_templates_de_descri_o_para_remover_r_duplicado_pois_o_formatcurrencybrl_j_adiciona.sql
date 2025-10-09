UPDATE public.pricing_tiers
SET description_template = 'Ponto Bronze - {{point_name}}. Boa localização com visibilidade básica. Preços: 1 ano {{price_1y}}, 2 anos {{price_2y}}, 3 anos {{price_3y}}, 4 anos {{price_4y}}, 5 anos {{price_5y}}'
WHERE name = 'Bronze';

UPDATE public.pricing_tiers
SET description_template = 'Ponto Prata - {{point_name}}. Excelente localização com boa visibilidade. Preços: 1 ano {{price_1y}}, 2 anos {{price_2y}}, 3 anos {{price_3y}}, 4 anos {{price_4y}}, 5 anos {{price_5y}}'
WHERE name = 'Prata';

UPDATE public.pricing_tiers
SET description_template = 'Ponto Ouro - {{point_name}}. Localização premium com alta visibilidade. Preços: 1 ano {{price_1y}}, 2 anos {{price_2y}}, 3 anos {{price_3y}}, 4 anos {{price_4y}}, 5 anos {{price_5y}}'
WHERE name = 'Ouro';