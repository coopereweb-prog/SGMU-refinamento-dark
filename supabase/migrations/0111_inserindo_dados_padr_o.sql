INSERT INTO public.pricing_tiers (name, price_1y, price_2y, price_3y, price_4y, price_5y, description_template)
VALUES 
  ('Bronze', 500, 900, 1300, 1600, 1900, 'Ponto Bronze - {{point_name}}. Boa localização com visibilidade básica. Preços: 1 ano {{price_1y}}, 2 anos {{price_2y}}, 3 anos {{price_3y}}, 4 anos {{price_4y}}, 5 anos {{price_5y}}'),
  ('Prata', 750, 1350, 1950, 2400, 2850, 'Ponto Prata - {{point_name}}. Excelente localização com boa visibilidade. Preços: 1 ano {{price_1y}}, 2 anos {{price_2y}}, 3 anos {{price_3y}}, 4 anos {{price_4y}}, 5 anos {{price_5y}}'),
  ('Ouro', 1000, 1800, 2600, 3200, 3800, 'Ponto Ouro - {{point_name}}. Localização premium com alta visibilidade. Preços: 1 ano {{price_1y}}, 2 anos {{price_2y}}, 3 anos {{price_3y}}, 4 anos {{price_4y}}, 5 anos {{price_5y}}')
ON CONFLICT (name) DO NOTHING;