UPDATE public.pricing_tiers
SET description_template = REPLACE(description_template, '{{point_name}}', '{{point_name}} no bairro {{neighborhood}}')
WHERE description_template IS NOT NULL;

-- Atualiza o template do Bronze
UPDATE public.pricing_tiers
SET description_template = 'Ponto de publicidade {{tier_name}} localizado na {{point_name}} no bairro {{neighborhood}}. Preços: 1 ano por {{price_1y}}, 2 anos por {{price_2y}}, 3 anos por {{price_3y}}, 4 anos por {{price_4y}}, 5 anos por {{price_5y}}.'
WHERE name = 'Bronze';

-- Atualiza o template do Prata
UPDATE public.pricing_tiers
SET description_template = 'Ponto de publicidade {{tier_name}} com alta visibilidade, localizado na {{point_name}} no bairro {{neighborhood}}. Preços: 1 ano por {{price_1y}}, 2 anos por {{price_2y}}, 3 anos por {{price_3y}}, 4 anos por {{price_4y}}, 5 anos por {{price_5y}}.'
WHERE name = 'Prata';

-- Atualiza o template do Ouro
UPDATE public.pricing_tiers
SET description_template = 'Ponto de publicidade {{tier_name}} (Premium) com localização estratégica na {{point_name}} no bairro {{neighborhood}}. Preços: 1 ano por {{price_1y}}, 2 anos por {{price_2y}}, 3 anos por {{price_3y}}, 4 anos por {{price_4y}}, 5 anos por {{price_5y}}.'
WHERE name = 'Ouro';