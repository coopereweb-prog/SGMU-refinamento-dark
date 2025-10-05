INSERT INTO public.points (
    name, 
    description, 
    latitude, 
    longitude, 
    pricing_tier_id, 
    is_available
) VALUES (
    'Ponto Teste Trigger',
    'Descrição do ponto teste',
    -22.78,
    -47.30,
    (SELECT id FROM public.pricing_tiers WHERE name = 'Ouro' LIMIT 1),
    true
) RETURNING id, name, price_1y, price_2y, price_3y, price_4y, price_5y;